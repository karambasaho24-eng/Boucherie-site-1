"use client";

import { useEffect, useState } from "react";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCart, selectSubtotal } from "@/store/cart";
import { useCartStore } from "@/components/providers/CartDrawerProvider";
import { formatPrice, cn } from "@/lib/utils";

export default function CartDrawer() {
  const cart = useCartStore();
  const items = useCart((s) => s.items);
  const subtotal = useCart(selectSubtotal);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (cart.isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [cart.isOpen]);

  return (
    <div
      aria-hidden={!cart.isOpen}
      className={cn(
        "fixed inset-0 z-50 transition-opacity duration-300",
        cart.isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      )}
    >
      <div
        onClick={cart.close}
        className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm"
      />
      <aside
        className={cn(
          "absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300",
          cart.isOpen ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-label="Panier"
      >
        <div className="flex items-center justify-between border-b border-ink-950/5 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-gold-600" />
            <h2 className="font-display text-lg font-semibold">Votre panier</h2>
            {mounted && items.length > 0 && (
              <span className="rounded-full bg-ink-950 px-2 py-0.5 text-xs font-semibold text-white">
                {items.length}
              </span>
            )}
          </div>
          <button
            onClick={cart.close}
            className="rounded-full p-2 text-ink-700 transition hover:bg-ink-950/5"
            aria-label="Fermer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!mounted || items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink-950/5 text-3xl">
                🥩
              </div>
              <h3 className="mt-4 font-display text-lg">Votre panier est vide</h3>
              <p className="mt-1 max-w-[220px] text-sm text-ink-700">
                Découvrez nos viandes halal premium et ajoutez vos préférées.
              </p>
              <Link
                href="/viandes"
                onClick={cart.close}
                className="btn-primary mt-6"
              >
                Découvrir nos viandes
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((it) => (
                <li
                  key={it.productId}
                  className="flex gap-3 rounded-xl border border-ink-950/5 p-3"
                >
                  <div
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-ink-950/5"
                    style={{
                      backgroundImage: it.image ? `url(${it.image})` : undefined,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate font-medium text-ink-950">
                          {it.name}
                        </div>
                        <div className="text-xs text-ink-700">
                          {formatPrice(it.unitPrice)} / unité
                        </div>
                      </div>
                      <button
                        onClick={() => cart.remove(it.productId)}
                        className="text-ink-700/60 transition hover:text-red-600"
                        aria-label="Retirer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="inline-flex items-center rounded-full border border-ink-950/10">
                        <button
                          onClick={() => cart.setQty(it.productId, it.quantity - 1)}
                          className="p-1.5 text-ink-800 transition hover:text-ink-950"
                          aria-label="Diminuer"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-7 text-center text-sm font-semibold">
                          {it.quantity}
                        </span>
                        <button
                          onClick={() => cart.setQty(it.productId, it.quantity + 1)}
                          className="p-1.5 text-ink-800 transition hover:text-ink-950"
                          aria-label="Augmenter"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="font-semibold">
                        {formatPrice(it.unitPrice * it.quantity)}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {mounted && items.length > 0 && (
          <div className="border-t border-ink-950/5 bg-white px-5 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-700">Sous-total</span>
              <span className="text-lg font-semibold">
                {formatPrice(subtotal)}
              </span>
            </div>
            <p className="mt-1 text-xs text-ink-700">
              Frais de livraison calculés à la commande.
            </p>
            <Link
              href="/commande"
              onClick={cart.close}
              className="btn-primary mt-4 w-full"
            >
              Passer commande
            </Link>
            <button
              onClick={cart.clear}
              className="mt-2 w-full text-center text-xs text-ink-700 underline-offset-4 hover:underline"
            >
              Vider le panier
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
