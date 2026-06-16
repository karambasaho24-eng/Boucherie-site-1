"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus, Check } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/store/cart";
import { Product } from "@/lib/types";
import { calcDiscount, cn, formatPrice } from "@/lib/utils";

export default function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const cart = useCart();
  const [added, setAdded] = useState(false);
  const discount = calcDiscount(product.price, product.promo_price);
  const finalPrice = product.promo_price ?? product.price;
  const outOfStock = !product.in_stock;

  function onAdd() {
    cart.add(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        unitPrice: finalPrice,
        image: product.image ?? "",
      },
      1
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  return (
    <article className="card group flex h-full flex-col overflow-hidden">
      <Link
        href={`/viandes/${product.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-ink-950/5"
      >
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            priority={priority}
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">🥩</div>
        )}

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.is_featured === 1 && (
            <span className="rounded-full bg-ink-950 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-gold-400">
              Vedette
            </span>
          )}
          {product.is_recent === 1 && (
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink-950 backdrop-blur">
              Nouveau
            </span>
          )}
          {discount > 0 && (
            <span className="rounded-full bg-gold-gradient px-2.5 py-1 text-[10px] font-semibold text-ink-950 shadow">
              -{discount}%
            </span>
          )}
        </div>

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-ink-950">
              Rupture de stock
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        {product.category_name && (
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-700">
            {product.category_name}
          </div>
        )}
        <Link
          href={`/viandes/${product.slug}`}
          className="mt-1 font-display text-lg font-medium text-ink-950 transition hover:text-gold-700"
        >
          {product.name}
        </Link>
        {product.description && (
          <p className="mt-1 line-clamp-2 text-sm text-ink-700">
            {product.description}
          </p>
        )}

        <div className="mt-4 flex items-end justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-semibold text-ink-950">
              {formatPrice(finalPrice)}
            </span>
            {product.promo_price && (
              <span className="text-sm text-ink-700 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          <button
            disabled={outOfStock}
            onClick={onAdd}
            className={cn(
              "inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition active:scale-95",
              outOfStock
                ? "cursor-not-allowed bg-ink-950/10 text-ink-700"
                : added
                ? "bg-emerald-800 text-white"
                : "bg-ink-950 text-white hover:bg-ink-800"
            )}
            aria-label="Ajouter au panier"
          >
            {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            <span className="hidden sm:inline">
              {outOfStock ? "Indisponible" : added ? "Ajouté" : "Ajouter"}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}
