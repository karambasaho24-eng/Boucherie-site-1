"use client";

import { useState } from "react";
import { Order } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { ChevronDown, Phone, Mail, MapPin, FileText } from "lucide-react";

const STATUSES = [
  { value: "pending", label: "En attente", color: "bg-amber-50 text-amber-700" },
  {
    value: "confirmed",
    label: "Confirmée",
    color: "bg-emerald-50 text-emerald-700",
  },
  { value: "shipped", label: "Expédiée", color: "bg-sky-50 text-sky-700" },
  {
    value: "delivered",
    label: "Livrée",
    color: "bg-emerald-900/10 text-emerald-800",
  },
  { value: "cancelled", label: "Annulée", color: "bg-red-50 text-red-700" },
];

export default function OrdersAdmin({
  initialOrders,
}: {
  initialOrders: Order[];
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);

  async function updateStatus(id: number, status: string) {
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setOrders((arr) =>
      arr.map((o) => (o.id === id ? { ...o, status } : o))
    );
  }

  const filtered = filter
    ? orders.filter((o) => o.status === filter)
    : orders;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilter("")}
          className={`chip ${!filter ? "chip-active" : ""}`}
        >
          Toutes
        </button>
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => setFilter(s.value)}
            className={`chip ${filter === s.value ? "chip-active" : ""}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-3xl border border-ink-950/5 bg-white shadow-soft">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-ink-700">Aucune commande.</div>
        ) : (
          <div className="divide-y divide-ink-950/5">
            {filtered.map((o) => {
              const status =
                STATUSES.find((s) => s.value === o.status) || STATUSES[0];
              return (
                <div key={o.id} className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display text-lg font-semibold">
                          #{o.id}
                        </span>
                        <span className="font-medium">{o.customer_name}</span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </div>
                      <div className="text-xs text-ink-700">
                        {new Date(o.created_at).toLocaleString("fr-FR")} ·{" "}
                        {formatPrice(o.total)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={o.status}
                        onChange={(e) => updateStatus(o.id, e.target.value)}
                        className="input py-2 text-xs"
                      >
                        {STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() =>
                          setOpenId((c) => (c === o.id ? null : o.id))
                        }
                        className="rounded-full border border-ink-950/10 p-2 text-ink-800 hover:border-gold-500"
                        aria-label="Détails"
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition ${
                            openId === o.id ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                  {openId === o.id && (
                    <div className="mt-3 grid gap-3 rounded-2xl border border-ink-950/5 bg-ink-950/[0.02] p-4 text-sm sm:grid-cols-2">
                      <div className="flex items-center gap-2 text-ink-800">
                        <Phone className="h-4 w-4 text-gold-600" />
                        <a
                          href={`tel:${o.customer_phone}`}
                          className="hover:text-gold-700"
                        >
                          {o.customer_phone}
                        </a>
                      </div>
                      {o.customer_email && (
                        <div className="flex items-center gap-2 text-ink-800">
                          <Mail className="h-4 w-4 text-gold-600" />
                          <a
                            href={`mailto:${o.customer_email}`}
                            className="hover:text-gold-700"
                          >
                            {o.customer_email}
                          </a>
                        </div>
                      )}
                      {o.customer_address && (
                        <div className="flex items-center gap-2 text-ink-800 sm:col-span-2">
                          <MapPin className="h-4 w-4 text-gold-600" />
                          {o.customer_address}
                        </div>
                      )}
                      {o.notes && (
                        <div className="flex items-start gap-2 text-ink-800 sm:col-span-2">
                          <FileText className="mt-0.5 h-4 w-4 text-gold-600" />
                          {o.notes}
                        </div>
                      )}
                      {o.items && o.items.length > 0 && (
                        <div className="sm:col-span-2">
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-700">
                            Articles
                          </div>
                          <ul className="mt-2 space-y-1">
                            {o.items.map((it) => (
                              <li
                                key={it.id}
                                className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs"
                              >
                                <span>
                                  {it.quantity}× {it.product_name}
                                </span>
                                <span className="font-semibold">
                                  {formatPrice(it.unit_price * it.quantity)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
