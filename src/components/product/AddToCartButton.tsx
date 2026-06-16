"use client";

import { useState } from "react";
import { Plus, Minus, Check, ShoppingBag } from "lucide-react";
import { useCart } from "@/store/cart";
import { Product } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";

export default function AddToCartButton({ product }: { product: Product }) {
  const cart = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const outOfStock = !product.in_stock;
  const finalPrice = product.promo_price ?? product.price;

  function add() {
    if (outOfStock) return;
    cart.add(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        unitPrice: finalPrice,
        image: product.image ?? "",
      },
      qty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="mt-8 rounded-2xl border border-ink-950/5 bg-white p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="text-sm text-ink-700">Quantité (kg)</div>
        <div className="inline-flex items-center rounded-full border border-ink-950/10">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="p-2 text-ink-800 hover:text-ink-950"
            aria-label="Diminuer"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center font-semibold">{qty}</span>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="p-2 text-ink-800 hover:text-ink-950"
            aria-label="Augmenter"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-ink-950/5 pt-4">
        <div>
          <div className="text-xs text-ink-700">Total</div>
          <div className="font-display text-2xl font-semibold">
            {formatPrice(finalPrice * qty)}
          </div>
        </div>
        <button
          disabled={outOfStock}
          onClick={add}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition active:scale-95",
            outOfStock
              ? "cursor-not-allowed bg-ink-950/10 text-ink-700"
              : added
              ? "bg-emerald-800 text-white"
              : "bg-ink-950 text-white hover:bg-ink-800"
          )}
        >
          {outOfStock ? (
            "Indisponible"
          ) : added ? (
            <>
              <Check className="h-4 w-4" /> Ajouté au panier
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" /> Ajouter au panier
            </>
          )}
        </button>
      </div>
    </div>
  );
}
