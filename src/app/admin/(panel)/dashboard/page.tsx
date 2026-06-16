import { getStats, getProducts, getOrders } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { Beef, ShoppingBag, Clock, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const stats = getStats();
  const products = getProducts();
  const orders = getOrders();
  const recentOrders = orders.slice(0, 5);
  const recentProducts = products.slice(0, 5);

  const statusLabel: Record<string, string> = {
    pending: "En attente",
    confirmed: "Confirmée",
    shipped: "Expédiée",
    delivered: "Livrée",
    cancelled: "Annulée",
  };
  const statusColor: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700",
    confirmed: "bg-emerald-50 text-emerald-700",
    shipped: "bg-sky-50 text-sky-700",
    delivered: "bg-emerald-900/10 text-emerald-800",
    cancelled: "bg-red-50 text-red-700",
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Reveal>
          <div className="rounded-3xl border border-ink-950/5 bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink-950 text-gold-400">
                <Beef className="h-4.5 w-4.5" />
              </div>
              <span className="text-xs text-ink-700">Total</span>
            </div>
            <div className="mt-3 font-display text-3xl font-semibold">
              {stats.totalProducts}
            </div>
            <div className="text-sm text-ink-700">Viandes en catalogue</div>
          </div>
        </Reveal>
        <Reveal delay={60}>
          <div className="rounded-3xl border border-ink-950/5 bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink-950 text-gold-400">
                <ShoppingBag className="h-4.5 w-4.5" />
              </div>
              <span className="text-xs text-ink-700">Total</span>
            </div>
            <div className="mt-3 font-display text-3xl font-semibold">
              {stats.totalOrders}
            </div>
            <div className="text-sm text-ink-700">Commandes reçues</div>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="rounded-3xl border border-ink-950/5 bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink-950 text-gold-400">
                <Clock className="h-4.5 w-4.5" />
              </div>
              <span className="text-xs text-ink-700">En attente</span>
            </div>
            <div className="mt-3 font-display text-3xl font-semibold">
              {stats.pendingOrders}
            </div>
            <div className="text-sm text-ink-700">À traiter</div>
          </div>
        </Reveal>
        <Reveal delay={180}>
          <div className="rounded-3xl border border-ink-950/5 bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink-950 text-gold-400">
                <TrendingUp className="h-4.5 w-4.5" />
              </div>
              <span className="text-xs text-ink-700">CA</span>
            </div>
            <div className="mt-3 font-display text-3xl font-semibold">
              {formatPrice(stats.revenue)}
            </div>
            <div className="text-sm text-ink-700">Chiffre d'affaires</div>
          </div>
        </Reveal>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Reveal className="lg:col-span-2" as="section">
          <div className="rounded-3xl border border-ink-950/5 bg-white shadow-soft">
            <div className="flex items-center justify-between border-b border-ink-950/5 p-5">
              <div>
                <h2 className="font-display text-lg font-medium">
                  Commandes récentes
                </h2>
                <p className="text-sm text-ink-700">
                  Les 5 dernières commandes clients
                </p>
              </div>
              <Link
                href="/admin/commandes"
                className="inline-flex items-center gap-1 text-sm font-semibold text-ink-950 hover:text-gold-700"
              >
                Tout voir <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <div className="p-10 text-center text-ink-700">
                Aucune commande pour l'instant.
              </div>
            ) : (
              <div className="divide-y divide-ink-950/5">
                {recentOrders.map((o) => (
                  <div
                    key={o.id}
                    className="flex flex-col gap-1 p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="font-semibold">
                        #{o.id} · {o.customer_name}
                      </div>
                      <div className="text-xs text-ink-700">
                        {o.customer_phone} ·{" "}
                        {new Date(o.created_at).toLocaleString("fr-FR")}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          statusColor[o.status] || "bg-ink-950/5"
                        }`}
                      >
                        {statusLabel[o.status] || o.status}
                      </span>
                      <div className="font-semibold">
                        {formatPrice(o.total)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Reveal>

        <Reveal delay={100} as="section">
          <div className="rounded-3xl border border-ink-950/5 bg-white p-5 shadow-soft">
            <h2 className="font-display text-lg font-medium">Viandes populaires</h2>
            <p className="text-sm text-ink-700">Les plus demandées</p>
            <ul className="mt-4 space-y-3">
              {stats.top.length === 0 && (
                <li className="text-sm text-ink-700">
                  Pas encore de données de vente.
                </li>
              )}
              {stats.top.map((t: any, i: number) => (
                <li key={t.id} className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-950 text-xs font-semibold text-gold-400">
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1 truncate text-sm font-medium">
                    {t.name}
                  </div>
                  <div className="text-sm text-ink-700">
                    {t.qty} vendu{t.qty > 1 ? "s" : ""}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>

      <Reveal as="section">
        <div className="rounded-3xl border border-ink-950/5 bg-white shadow-soft">
          <div className="flex items-center justify-between border-b border-ink-950/5 p-5">
            <div>
              <h2 className="font-display text-lg font-medium">
                Produits récents
              </h2>
              <p className="text-sm text-ink-700">Aperçu du catalogue</p>
            </div>
            <Link
              href="/admin/produits"
              className="inline-flex items-center gap-1 text-sm font-semibold text-ink-950 hover:text-gold-700"
            >
              Gérer <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
            {recentProducts.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-2xl border border-ink-950/5 p-3"
              >
                <div
                  className="h-14 w-14 shrink-0 rounded-xl bg-ink-950/5"
                  style={{
                    backgroundImage: p.image ? `url(${p.image})` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{p.name}</div>
                  <div className="text-xs text-ink-700">
                    {formatPrice(p.promo_price ?? p.price)}
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    p.in_stock
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {p.in_stock ? "En stock" : "Rupture"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  );
}
