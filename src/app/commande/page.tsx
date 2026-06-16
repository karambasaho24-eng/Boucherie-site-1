"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Trash2, ArrowRight, Check } from "lucide-react";
import { useCart, selectSubtotal } from "@/store/cart";
import { formatPrice } from "@/lib/utils";

export default function CommandePage() {
  const cart = useCart();
  const items = useCart((s) => s.items);
  const subtotal = useCart(selectSubtotal);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<null | { id: number; total: number }>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!items.length) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          customer_name: name,
          customer_phone: phone,
          customer_email: email,
          customer_address: address,
          notes,
          items: items.map((i) => ({
            product_id: i.productId,
            product_name: i.name,
            unit_price: i.unitPrice,
            quantity: i.quantity,
          })),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur lors de la commande");
      }
      const data = await res.json();
      cart.clear();
      setDone({ id: data.id, total: data.total });
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null;

  if (done) {
    return (
      <div className="container-x flex min-h-[60vh] items-center justify-center py-20">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-900 text-white">
            <Check className="h-7 w-7" />
          </div>
          <h1 className="mt-6 font-display text-3xl font-medium">
            Commande confirmée
          </h1>
          <p className="mt-2 text-ink-700">
            Merci ! Votre commande #{done.id} d'un montant de{" "}
            <strong>{formatPrice(done.total)}</strong> a bien été enregistrée.
            Nous vous recontactons très vite.
          </p>
          <button
            onClick={() => router.push("/")}
            className="btn-primary mt-6"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="container-x flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <ShoppingBag className="h-12 w-12 text-ink-700/40" />
        <h1 className="mt-4 font-display text-2xl">Votre panier est vide</h1>
        <p className="mt-2 max-w-sm text-ink-700">
          Ajoutez d'abord des viandes à votre panier.
        </p>
        <button
          onClick={() => router.push("/viandes")}
          className="btn-primary mt-6"
        >
          Découvrir nos viandes
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="container-x py-10">
        <h1 className="font-display text-3xl font-medium sm:text-4xl">Votre commande</h1>
        <p className="mt-2 text-ink-700">Vérifiez vos articles et passez commande.</p>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <form onSubmit={submit} className="lg:col-span-2">
            <div className="rounded-2xl border border-ink-950/5 bg-white p-6 shadow-soft">
              <h2 className="font-display text-lg font-medium">Vos coordonnées</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Nom complet *</label>
                  <input
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label">Téléphone *</label>
                  <input
                    className="input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Email</label>
                  <input
                    className="input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Adresse de livraison</label>
                  <input
                    className="input"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Notes (optionnel)</label>
                  <textarea
                    className="input min-h-[100px] resize-y"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Découpe spéciale, heure de livraison, etc."
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-6 w-full sm:w-auto"
            >
              {loading ? "Envoi..." : "Confirmer la commande"}{" "}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <aside className="rounded-2xl border border-ink-950/5 bg-ink-950/[0.02] p-6">
            <h2 className="font-display text-lg font-medium">Récapitulatif</h2>
            <ul className="mt-4 space-y-3">
              {items.map((it) => (
                <li key={it.productId} className="flex items-center gap-3 text-sm">
                  <div
                    className="h-12 w-12 shrink-0 rounded-lg bg-ink-950/[0.05]"
                    style={{
                      backgroundImage: it.image ? `url(${it.image})` : undefined,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{it.name}</div>
                    <div className="text-xs text-ink-700">
                      {it.quantity} × {formatPrice(it.unitPrice)}
                    </div>
                  </div>
                  <div className="font-semibold">
                    {formatPrice(it.unitPrice * it.quantity)}
                  </div>
                  <button
                    onClick={() => cart.remove(it.productId)}
                    className="text-ink-700/60 hover:text-red-600"
                    aria-label="Retirer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-5 border-t border-ink-950/10 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span>Sous-total</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm text-ink-700">
                <span>Livraison</span>
                <span>Calculée par téléphone</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-ink-950/10 pt-3 text-lg font-semibold">
                <span>Total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
