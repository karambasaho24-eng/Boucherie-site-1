import { useEffect, useRef, useState } from 'react'
import { fetchOrders, updateOrderStatus } from '../../lib/api'

// Pas de deleteOrder importé — la suppression est intentionnellement absente de cette interface

const STATUSES = [
  { value: 'pending',   label: 'En attente',      color: '#8a8a86' },
  { value: 'confirmed', label: 'Confirmée',        color: '#0a0a0a' },
  { value: 'preparing', label: 'En préparation',   color: '#0a0a0a' },
  { value: 'ready',     label: 'Prête',            color: '#2f6b3a' },
  { value: 'completed', label: 'Terminée',         color: '#6b6b68' },
  { value: 'cancelled', label: 'Annulée',          color: '#b5181f' },
  { value: 'expired',   label: 'Expirée (no-show)', color: '#b5181f' },
]

const REFRESH_INTERVAL_MS = 15000

// Détecte le format "Nh" (ex: "2h", "1h") pour calculer l'expiration automatique
function parsePickupDelayHours(delay) {
  if (!delay) return null
  const m = String(delay).trim().match(/^(\d+(?:\.\d+)?)\s*h$/i)
  return m ? parseFloat(m[1]) : null
}

// Retourne true si la commande doit passer en expired côté client
function shouldExpire(order) {
  if (order.status === 'completed' || order.status === 'cancelled' || order.status === 'expired') return false
  const delay = order.pickup_deadline
  const hours = parsePickupDelayHours(delay)
  if (hours === null) return false
  const created = new Date(order.created_at).getTime()
  const expiresAt = created + hours * 3600 * 1000
  return Date.now() > expiresAt
}

function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(880, ctx.currentTime)
    gain.gain.setValueAtTime(0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.start()
    oscillator.stop(ctx.currentTime + 0.4)
  } catch { /* audio bloqué – pas grave */ }
}

function statusLabel(s) { return STATUSES.find((x) => x.value === s)?.label || s }
function statusColor(s) { return STATUSES.find((x) => x.value === s)?.color || '#aaa' }

function formatDate(d) {
  return new Date(d).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [filter, setFilter] = useState('all')
  const [newOrderAlert, setNewOrderAlert] = useState(false)
  const knownIdsRef = useRef(new Set())
  const isFirstLoadRef = useRef(true)

  async function load() {
    try {
      const data = await fetchOrders()

      // Expiration automatique côté client — si délai numérique dépassé, on met à jour en base
      const toExpire = data.filter(shouldExpire)
      for (const o of toExpire) {
        try { await updateOrderStatus(o.id, 'expired') } catch { /* silencieux */ }
      }

      // Recharger après expiration si des commandes ont été mises à jour
      const finalData = toExpire.length > 0 ? await fetchOrders() : data

      if (!isFirstLoadRef.current) {
        const newOnes = finalData.filter((o) => !knownIdsRef.current.has(o.id))
        if (newOnes.length > 0) {
          playNotificationSound()
          setNewOrderAlert(true)
          setTimeout(() => setNewOrderAlert(false), 4000)
        }
      }
      knownIdsRef.current = new Set(finalData.map((o) => o.id))
      isFirstLoadRef.current = false
      setOrders(finalData)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, REFRESH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  async function handleStatus(id, status) {
    try {
      const updated = await updateOrderStatus(id, status)
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)))
    } catch {
      alert('Erreur mise à jour statut.')
    }
  }

  // Comptages par statut pour les onglets
  const countByStatus = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1
    return acc
  }, {})
  const expiredCount = countByStatus['expired'] || 0

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter)

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Commandes ({orders.length})</h2>
        <select
          className="select"
          style={{ width: 'auto' }}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Toutes ({orders.length})</option>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}{countByStatus[s.value] ? ` (${countByStatus[s.value]})` : ''}
            </option>
          ))}
        </select>
      </div>

      {expiredCount > 0 && (
        <div className="expired-alert">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {expiredCount} commande{expiredCount > 1 ? 's' : ''} expirée{expiredCount > 1 ? 's' : ''} (no-show) —{' '}
          <button className="expired-alert-link" onClick={() => setFilter('expired')}>voir</button>
        </div>
      )}

      {newOrderAlert && (
        <div className="new-order-alert">Nouvelle commande reçue</div>
      )}

      {loading ? (
        <p className="text-muted">Chargement…</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted">Aucune commande{filter !== 'all' ? ' pour ce statut' : ''}.</p>
      ) : (
        <div className="orders-list">
          {filtered.map((order) => (
            <div key={order.id} className={`order-card${order.status === 'expired' ? ' order-card-expired' : ''}`}>
              <div className="order-head" onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                <div>
                  <span className="order-id">#{order.id.slice(0, 8).toUpperCase()}</span>
                  <span className="order-client">{order.customer_name}</span>
                </div>
                <div className="order-head-right">
                  {order.pickup_deadline && (
                    <span className="order-pickup-badge">
                      ⏱ {order.pickup_deadline}
                    </span>
                  )}
                  <span className="order-total">{Number(order.total_price).toFixed(2)} €</span>
                  <span className="order-status-dot" style={{ background: statusColor(order.status) }}>
                    {statusLabel(order.status)}
                  </span>
                  <span className="text-muted chevron">{expanded === order.id ? '−' : '+'}</span>
                </div>
              </div>

              {expanded === order.id && (
                <div className="order-body">
                  <div className="order-meta-row">
                    <span>{order.phone}</span>
                    {order.address && <span>{order.address}</span>}
                    <span className="text-muted">{formatDate(order.created_at)}</span>
                  </div>

                  {order.pickup_deadline && (
                    <div className="pickup-info">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                      Délai de retrait : <strong>{order.pickup_deadline}</strong>
                    </div>
                  )}

                  <div className="order-items-list">
                    {(order.items || []).map((item, i) => (
                      <div key={i} className="order-item-row">
                        <span>{item.name}</span>
                        <span className="text-muted">x{item.qty}</span>
                        <span>{(item.price * item.qty).toFixed(2)} €</span>
                      </div>
                    ))}
                    <div className="order-item-row total">
                      <strong>Total</strong><span /><strong>{Number(order.total_price).toFixed(2)} €</strong>
                    </div>
                  </div>

                  <div className="status-actions">
                    <span className="text-muted" style={{ fontSize: 12 }}>Changer le statut :</span>
                    <div className="status-btns">
                      {STATUSES.map((s) => (
                        <button
                          key={s.value}
                          className={`btn btn-sm ${order.status === s.value ? 'btn-primary' : 'btn-outline'}`}
                          onClick={() => handleStatus(order.id, s.value)}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* PAS de bouton "Supprimer la commande" — historique non supprimable par design */}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style>{`
        .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
        .section-header h2 { margin: 0; font-family: var(--font-display); font-weight: 600; font-size: 22px; letter-spacing: -0.3px; }
        .expired-alert {
          display: flex; align-items: center; gap: 8px;
          background: rgba(181,24,31,0.06); border: 1px solid rgba(181,24,31,0.3);
          padding: 10px 14px; margin-bottom: 16px;
          font-size: 13px; font-family: var(--font-mono); color: var(--color-red);
        }
        .expired-alert svg { flex-shrink: 0; }
        .expired-alert-link {
          background: none; border: none; color: var(--color-red);
          font-weight: 700; text-decoration: underline; cursor: pointer;
          font-family: var(--font-mono); font-size: 13px; padding: 0;
        }
        .new-order-alert {
          background: var(--color-ink); color: var(--color-paper);
          font-weight: 600; font-size: 13px; letter-spacing: 0.5px;
          padding: 12px 16px; margin-bottom: 18px; text-align: center;
          animation: pulse-alert 1.4s ease-in-out infinite;
        }
        @keyframes pulse-alert { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        .orders-list { display: flex; flex-direction: column; gap: 0; border-top: 1px solid var(--color-border); }
        .order-card { overflow: hidden; border-bottom: 1px solid var(--color-border); }
        .order-card-expired { background: rgba(181,24,31,0.03); }
        .order-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 4px; cursor: pointer; gap: 12px; flex-wrap: wrap;
        }
        .order-id { font-family: var(--font-mono); font-weight: 700; font-size: 12px; margin-right: 12px; color: var(--color-text-muted); }
        .order-client { font-weight: 700; font-family: var(--font-heading); }
        .order-head-right { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
        .order-pickup-badge {
          font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.3px;
          color: var(--color-text-muted); background: var(--color-paper-dim);
          border: 1px solid var(--color-border); padding: 3px 8px;
        }
        .order-total { font-weight: 700; font-family: var(--font-mono); }
        .order-status-dot { font-size: 11px; font-weight: 700; letter-spacing: 0.5px; color: #fff; padding: 4px 11px; }
        .chevron { font-family: var(--font-mono); font-size: 16px; width: 16px; text-align: center; }
        .order-body { padding: 0 4px 20px; border-top: 1px solid var(--color-border); }
        .order-meta-row { display: flex; flex-wrap: wrap; gap: 16px; padding: 14px 0; font-size: 13px; }
        .pickup-info {
          display: flex; align-items: center; gap: 6px;
          font-family: var(--font-mono); font-size: 11px;
          color: var(--color-text-muted); margin-bottom: 12px;
          letter-spacing: 0.3px;
        }
        .pickup-info strong { color: var(--color-text); }
        .order-items-list { background: var(--color-paper-dim); padding: 14px 16px; margin-bottom: 16px; }
        .order-item-row { display: grid; grid-template-columns: 1fr 40px 80px; gap: 8px; padding: 5px 0; font-size: 13px; font-family: var(--font-mono); }
        .order-item-row.total { border-top: 1px solid var(--color-border); margin-top: 8px; padding-top: 10px; }
        .status-actions { display: flex; flex-direction: column; gap: 10px; }
        .status-actions > .text-muted { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.5px; text-transform: uppercase; }
        .status-btns { display: flex; flex-wrap: wrap; gap: 6px; }
      `}</style>
    </div>
  )
}
