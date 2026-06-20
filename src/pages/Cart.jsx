import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import { createOrder } from '../lib/api'

const STATUS_LABELS = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  preparing: 'En préparation',
  ready: 'Prête',
  completed: 'Terminée',
  cancelled: 'Annulée',
  expired: 'Expirée',
}

const CUSTOMER_STORAGE_KEY = 'carrefour_orient_customer'

function isValidPhone(phone) {
  const cleaned = phone.replace(/[\s.\-]/g, '')
  return /^(\+33|0)[1-9](\d{8})$/.test(cleaned)
}

function buildWhatsAppMessage({ orderId, form, items, total, pickupDeadline }) {
  const lines = [
    `Commande #${orderId}`,
    `${form.customer_name}`,
    `Tél. ${form.phone}`,
    form.address ? `Adresse : ${form.address}` : null,
    ``,
    ...items.map((i) => `- ${i.name} x${i.qty} — ${(i.price * i.qty).toFixed(2)} €`),
    ``,
    `Total : ${total.toFixed(2)} €`,
    pickupDeadline ? `Retrait : ${pickupDeadline}` : null,
  ]
  return lines.filter((l) => l !== null).join('\n')
}

function formatDateTime(date) {
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// Ticket de caisse — rendu HTML servant à la fois d'affichage et de source pour html2canvas
function Receipt({ order, form, items, total, shopName, pickupDeadline }) {
  const orderId = order?.id?.slice(0, 8).toUpperCase() || '--------'
  const createdAt = order?.created_at ? formatDateTime(order.created_at) : formatDateTime(new Date())

  return (
    <div
      id="receipt-printable"
      style={{
        fontFamily: 'Courier New, Courier, monospace',
        fontSize: 13,
        background: '#fff',
        color: '#000',
        width: 320,
        padding: '28px 24px',
        lineHeight: 1.55,
        letterSpacing: 0,
      }}
    >
      {/* En-tête */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 1 }}>{shopName || 'BOUCHERIE'}</div>
        <div style={{ fontSize: 11, marginTop: 4, color: '#444' }}>TICKET DE COMMANDE</div>
      </div>

      <Divider />

      <Row label="Commande" value={`#${orderId}`} />
      <Row label="Date" value={createdAt} />

      <Divider />

      <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6, letterSpacing: 0.5 }}>ARTICLES</div>
      {items.map((i, idx) => (
        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>
            {i.name} x{i.qty}
          </span>
          <span style={{ flexShrink: 0, fontWeight: 600 }}>{(i.price * i.qty).toFixed(2)} €</span>
        </div>
      ))}

      <Divider />

      <Row label="TOTAL" value={`${total.toFixed(2)} €`} bold />

      <Divider />

      <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6, letterSpacing: 0.5 }}>CLIENT</div>
      <Row label="Nom" value={form.customer_name} />
      <Row label="Tél." value={form.phone} />
      {form.address && <Row label="Adresse" value={form.address} />}

      {pickupDeadline && (
        <>
          <Divider />
          <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6, letterSpacing: 0.5 }}>RETRAIT</div>
          <div style={{ fontSize: 12, fontWeight: 700 }}>{pickupDeadline}</div>
          <div style={{ fontSize: 11, color: '#555', marginTop: 4 }}>
            Passé ce délai, votre commande peut être annulée.
          </div>
        </>
      )}

      <Divider />

      <div style={{ textAlign: 'center', fontSize: 11, color: '#555', marginTop: 4, lineHeight: 1.6 }}>
        Conservez ce ticket.<br />
        Il est votre seule preuve de commande.
      </div>
    </div>
  )
}

function Row({ label, value, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, fontSize: 12 }}>
      <span style={{ color: '#555', flexShrink: 0, paddingRight: 8 }}>{label}</span>
      <span style={{ fontWeight: bold ? 700 : 400, textAlign: 'right', flex: 1 }}>{value}</span>
    </div>
  )
}

function Divider() {
  return (
    <div style={{ borderTop: '1px dashed #bbb', margin: '10px 0' }} />
  )
}

// -------------------------------------------------------
// Composant principal
// -------------------------------------------------------
export default function Cart({ config }) {
  const { items, removeItem, updateQty, clearCart, total, count } = useCart()
  const [form, setForm] = useState({ customer_name: '', phone: '', address: '' })
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const [ticketDownloaded, setTicketDownloaded] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const receiptRef = useRef()

  const shopName = config?.site_title || 'Boucherie'
  const whatsappNumber = (config?.whatsapp_number || '').replace(/\D/g, '')
  const orderMode = config?.order_mode || 'both'
  const showSiteButton = orderMode === 'site' || orderMode === 'both'
  const showWhatsAppButton = (orderMode === 'whatsapp' || orderMode === 'both') && !!whatsappNumber
  const pickupDeadline = config?.pickup_delay || ''
  const editDeadlineMinutes = config?.edit_deadline_minutes ?? 60

  // Calcul du délai de modification pour affichage
  const editDeadlineLabel = editDeadlineMinutes >= 60
    ? `${Math.round(editDeadlineMinutes / 60)}h`
    : `${editDeadlineMinutes} min`

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CUSTOMER_STORAGE_KEY)
      if (raw) {
        const saved = JSON.parse(raw)
        setForm((f) => ({
          ...f,
          customer_name: saved.customer_name || '',
          phone: saved.phone || '',
          address: saved.address || '',
        }))
      }
    } catch { /* navigation privée – pas bloquant */ }
  }, [])

  function handleField(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  function rememberCustomer() {
    try {
      localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(form))
    } catch { /* pas bloquant */ }
  }

  function validate() {
    if (!form.customer_name.trim()) return 'Veuillez indiquer votre nom.'
    if (!form.phone.trim()) return 'Veuillez indiquer votre téléphone.'
    if (!isValidPhone(form.phone.trim())) return 'Le numéro de téléphone semble invalide.'
    if (items.length === 0) return 'Votre panier est vide.'
    return null
  }

  async function handleDownloadTicket() {
    setDownloading(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(document.getElementById('receipt-printable'), {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      })
      const link = document.createElement('a')
      link.download = `ticket-commande-${order.id.slice(0, 8).toUpperCase()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      setTicketDownloaded(true)
    } catch (err) {
      console.error('Erreur génération ticket :', err)
      // Même en cas d'échec technique, on débloque le parcours
      setTicketDownloaded(true)
    } finally {
      setDownloading(false)
    }
  }

  // OPTION 1 — Commande classique via Supabase
  async function handleSubmitOrder() {
    const validationError = validate()
    if (validationError) { setError(validationError); return }
    setError('')
    setLoading(true)
    try {
      const orderData = {
        customer_name: form.customer_name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        items: items.map((i) => ({ id: i.id, name: i.name, qty: i.qty, price: i.price })),
        total_price: total,
        status: 'pending',
        pickup_deadline: pickupDeadline || null,
      }
      const created = await createOrder(orderData)
      rememberCustomer()
      clearCart()
      setOrder(created)
    } catch (err) {
      console.error('Erreur création commande :', err)
      setError("Erreur serveur. Votre commande n'a pas pu être enregistrée. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  // OPTION 2 — Commande via WhatsApp (Supabase en best-effort, WhatsApp toujours ouvert)
  async function handleSubmitWhatsApp() {
    const validationError = validate()
    if (validationError) { setError(validationError); return }
    if (!whatsappNumber) { setError("WhatsApp n'est pas configuré."); return }
    setError('')
    setLoading(true)

    let orderId = Date.now().toString(36).toUpperCase()
    let createdOrder = null

    try {
      const orderData = {
        customer_name: form.customer_name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        items: items.map((i) => ({ id: i.id, name: i.name, qty: i.qty, price: i.price })),
        total_price: total,
        status: 'pending',
        pickup_deadline: pickupDeadline || null,
      }
      createdOrder = await createOrder(orderData)
      orderId = createdOrder.id.slice(0, 8).toUpperCase()
      rememberCustomer()
    } catch (err) {
      console.error('Commande non enregistrée en base (WhatsApp en secours) :', err)
    }

    const message = buildWhatsAppMessage({ orderId, form, items, total, pickupDeadline })
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank')

    clearCart()

    if (createdOrder) {
      setOrder(createdOrder)
    } else {
      // Fallback si Supabase a échoué : on construit un ordre local pour le ticket
      setOrder({
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        status: 'pending',
        customer_name: form.customer_name.trim(),
        phone: form.phone.trim(),
        total_price: total,
      })
    }

    setLoading(false)
  }

  // -------------------------------------------------------
  // ÉTAT POST-COMMANDE : ticket de caisse + verrouillage
  // -------------------------------------------------------
  if (order) {
    const orderId = order.id?.slice(0, 8).toUpperCase() || '--------'

    return (
      <div className="container cart-page">
        <div className="receipt-page">
          {/* Avertissement principal */}
          <div className="receipt-warning">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <p>
              Téléchargez ce ticket ou faites une capture d'écran —{' '}
              <strong>c'est votre seule preuve de commande</strong>, conservez-le.
            </p>
          </div>

          {/* Ticket rendu */}
          <div className="receipt-wrapper" ref={receiptRef}>
            <Receipt
              order={order}
              form={{ customer_name: order.customer_name || form.customer_name, phone: order.phone || form.phone, address: form.address }}
              items={order.items || items}
              total={Number(order.total_price) || total}
              shopName={shopName}
              pickupDeadline={order.pickup_deadline || pickupDeadline}
            />
          </div>

          {/* Bouton téléchargement — OBLIGATOIRE */}
          <button
            className="btn btn-primary receipt-download-btn"
            onClick={handleDownloadTicket}
            disabled={downloading}
          >
            {downloading ? 'Génération…' : ticketDownloaded ? '✓ Ticket téléchargé' : '⬇ Télécharger le ticket'}
          </button>

          {!ticketDownloaded && (
            <p className="receipt-gate-msg">
              La commande est finalisée une fois le ticket téléchargé.
            </p>
          )}

          {/* Infos post-validation — visibles seulement après téléchargement */}
          {ticketDownloaded && (
            <div className="receipt-confirmed">
              <div className="order-success-mark" aria-hidden="true">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 12.5l2.6 2.6L16 9.5" />
                </svg>
              </div>
              <h2>Commande #{orderId} enregistrée</h2>
              <p className="text-muted">La boucherie va traiter votre commande dans les plus brefs délais.</p>

              {/* Verrouillage — message de non-modification */}
              {editDeadlineMinutes > 0 && (
                <div className="lock-notice">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  <span>
                    Vos informations ne sont plus modifiables après validation.
                    Pour toute modification, contactez la boucherie au{' '}
                    <strong>{config?.phone || '—'}</strong>{' '}
                    dans un délai de <strong>{editDeadlineLabel}</strong>.
                  </span>
                </div>
              )}

              <div className="order-meta">
                <span>Statut</span>
                <span className="badge badge-status">{STATUS_LABELS[order.status] || order.status}</span>
              </div>

              <Link to="/boutique" className="btn btn-primary btn-block" style={{ marginTop: 20 }}>
                Continuer mes achats
              </Link>
            </div>
          )}
        </div>

        <style>{`
          .receipt-page { max-width: 480px; margin: 48px auto; padding: 0 16px 64px; }
          .receipt-warning {
            display: flex; align-items: flex-start; gap: 12px;
            background: #fffbe6; border: 1px solid #e6c800;
            padding: 14px 16px; margin-bottom: 24px;
            font-size: 13px; line-height: 1.5;
          }
          .receipt-warning svg { flex-shrink: 0; color: #b58b00; margin-top: 1px; }
          .receipt-warning p { margin: 0; }
          .receipt-wrapper {
            display: flex; justify-content: center;
            border: 1px solid var(--color-border);
            background: #fff;
            margin-bottom: 16px;
            overflow: hidden;
          }
          .receipt-download-btn { width: 100%; margin-bottom: 8px; }
          .receipt-gate-msg {
            font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.5px;
            text-align: center; color: var(--color-text-muted); margin: 0 0 24px;
          }
          .receipt-confirmed { margin-top: 32px; text-align: center; }
          .order-success-mark { color: var(--color-ink); margin-bottom: 16px; }
          .receipt-confirmed h2 {
            font-family: var(--font-display); font-weight: 600; font-size: 22px;
            margin: 0 0 8px; letter-spacing: -0.3px;
          }
          .lock-notice {
            display: flex; align-items: flex-start; gap: 10px;
            background: var(--color-paper-dim);
            border: 1px solid var(--color-border);
            padding: 14px 16px; margin: 20px 0;
            font-size: 12.5px; line-height: 1.55; text-align: left;
            color: var(--color-text-muted);
          }
          .lock-notice svg { flex-shrink: 0; margin-top: 2px; color: var(--color-ink); }
          .lock-notice strong { color: var(--color-text); }
          .order-meta {
            margin-top: 20px; display: flex; justify-content: space-between; align-items: center;
            border-top: 1px solid var(--color-border); border-bottom: 1px solid var(--color-border);
            padding: 14px 0;
            font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.5px;
            text-transform: uppercase; color: var(--color-text-muted);
          }
        `}</style>
      </div>
    )
  }

  // -------------------------------------------------------
  // ÉTAT PANIER NORMAL
  // -------------------------------------------------------
  return (
    <div className="cart-page">
      <div className="cart-page-header">
        <div className="container">
          <div className="section-label section-label-light">Récapitulatif</div>
          <h1>Mon panier {count > 0 && <span className="cart-count-sub">({count} article{count > 1 ? 's' : ''})</span>}</h1>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="empty-cart">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          <p>Votre panier est vide.</p>
          <Link to="/boutique" className="btn btn-primary">Voir la boutique</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {items.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-img">
                  {item.image_url ? <img src={item.image_url} alt={item.name} loading="lazy" /> : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <path d="M4 4h16v16H4z" /><path d="M4 14l5-5 4 4 7-7" />
                    </svg>
                  )}
                </div>
                <div className="cart-item-info">
                  <p className="cart-item-name">{item.name}</p>
                  <p className="text-muted">{item.price.toFixed(2)} € / unité</p>
                </div>
                <div className="cart-item-actions">
                  <div className="qty-controls">
                    <button onClick={() => updateQty(item.id, item.qty - 1)} aria-label="Diminuer">−</button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)} aria-label="Augmenter">+</button>
                  </div>
                  <p className="item-total">{(item.price * item.qty).toFixed(2)} €</p>
                  <button className="remove-btn" onClick={() => removeItem(item.id)} aria-label="Retirer">✕</button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-sidebar">
            <div className="order-form">
              <h3>Vos coordonnées</h3>

              <div className="field">
                <label>Nom *</label>
                <input className="input" name="customer_name" value={form.customer_name} onChange={handleField} placeholder="Votre nom" />
              </div>
              <div className="field">
                <label>Téléphone *</label>
                <input className="input" name="phone" value={form.phone} onChange={handleField} placeholder="06 XX XX XX XX" type="tel" />
              </div>
              <div className="field">
                <label>Adresse (optionnel)</label>
                <input className="input" name="address" value={form.address} onChange={handleField} placeholder="Pour livraison / retrait" />
              </div>

              {error && <p className="error-msg">{error}</p>}

              <div className="total-row">
                <span>Total</span>
                <strong>{total.toFixed(2)} €</strong>
              </div>

              {showSiteButton && (
                <button
                  className="btn btn-primary btn-block"
                  style={{ marginTop: 16 }}
                  onClick={handleSubmitOrder}
                  disabled={loading}
                >
                  {loading ? 'Envoi en cours…' : 'Valider la commande'}
                </button>
              )}

              {showWhatsAppButton && (
                <button
                  className="btn btn-whatsapp btn-block"
                  style={{ marginTop: 10 }}
                  onClick={handleSubmitWhatsApp}
                  disabled={loading}
                >
                  Commander via WhatsApp
                </button>
              )}

              {!showSiteButton && !showWhatsAppButton && (
                <p className="error-msg" style={{ marginTop: 12 }}>
                  La commande en ligne est momentanément indisponible. Merci de nous appeler directement.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .cart-page { padding: 0 0 70px; }
        .cart-page-header {
          background: var(--color-ink);
          padding: 56px 0 40px;
          color: var(--color-paper);
          margin-bottom: 40px;
        }
        .cart-page h1 {
          font-family: var(--font-heading);
          font-size: 36px;
          font-weight: 800;
          letter-spacing: -0.5px;
          margin: 6px 0 0;
          color: var(--color-paper);
        }
        .cart-count-sub { font-weight: 400; font-size: 18px; opacity: 0.55; }
        .empty-cart {
          text-align: center; padding: 80px 20px;
          display: flex; flex-direction: column; align-items: center; gap: 18px;
          color: var(--color-text-muted);
        }
        .empty-cart > p { font-size: 15px; color: var(--color-text-muted); margin: 0; }
        .cart-layout { display: grid; gap: 28px; padding: 0 20px; max-width: 1200px; margin: 0 auto; }
        .cart-items { display: flex; flex-direction: column; gap: 0; border-top: 1px solid var(--color-border); }
        .cart-item {
          display: grid; grid-template-columns: 72px 1fr auto;
          align-items: center; gap: 16px; padding: 18px 0;
          border-bottom: 1px solid var(--color-border);
        }
        .cart-item-img {
          width: 72px; height: 72px; overflow: hidden;
          background: var(--color-paper-dim);
          display: flex; align-items: center; justify-content: center;
          color: var(--color-border-dark); flex-shrink: 0;
        }
        .cart-item-img img { width: 100%; height: 100%; object-fit: cover; }
        .cart-item-name { font-weight: 700; margin: 0 0 4px; font-size: 15px; font-family: var(--font-heading); letter-spacing: -0.1px; }
        .cart-item-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
        .qty-controls { display: flex; align-items: center; gap: 0; border: 1px solid var(--color-border); }
        .qty-controls button {
          width: 28px; height: 28px; border: none; background: transparent;
          font-size: 15px; display: flex; align-items: center; justify-content: center;
          transition: background 0.15s;
        }
        .qty-controls button:hover { background: var(--color-paper-dim); }
        .qty-controls span { font-weight: 600; min-width: 26px; text-align: center; font-size: 13px; font-family: var(--font-mono); }
        .item-total { font-weight: 700; font-size: 15px; margin: 0; color: var(--color-text); font-family: var(--font-mono); }
        .remove-btn {
          background: none; border: none; color: var(--color-text-muted); font-size: 13px;
          width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;
          transition: color 0.15s;
        }
        .remove-btn:hover { color: var(--color-red); }
        .order-form { padding: 0; }
        .order-form h3 {
          font-family: var(--font-display); font-weight: 600; font-size: 19px;
          margin: 0 0 24px; color: var(--color-text);
        }
        .total-row {
          display: flex; justify-content: space-between; align-items: center;
          border-top: 1px solid var(--color-border); padding-top: 16px; margin-top: 8px;
          font-size: 22px; font-weight: 700; font-family: var(--font-mono); color: var(--color-text);
        }
        .total-row span { font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: var(--color-text-muted); font-family: var(--font-mono); }
        .error-msg { color: var(--color-red); font-size: 13px; margin: 4px 0; background: rgba(181,24,31,0.06); padding: 12px 14px; border: 1px solid rgba(181,24,31,0.25); }
        .btn-whatsapp { background: #25d366; color: #fff; border-color: #25d366; }
        .btn-whatsapp:hover { background: transparent; color: #25d366; }
        @media (min-width: 768px) {
          .cart-layout { grid-template-columns: 1fr 380px; padding: 0 32px; }
        }
      `}</style>
    </div>
  )
}
