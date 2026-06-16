import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, Check, Truck, Award, Clock } from "lucide-react";
import {
  getProductBySlug,
  getProducts,
  incrementProductViews,
} from "@/lib/data";
import { calcDiscount, formatPrice, slugify } from "@/lib/utils";
import AddToCartButton from "@/components/product/AddToCartButton";
import ProductCard from "@/components/product/ProductCard";
import Reveal from "@/components/ui/Reveal";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = getProductBySlug(params.slug);
  if (!product) notFound();
  incrementProductViews(product.id);
  const related = getProducts({ categorySlug: product.category_slug })
    .filter((p) => p.id !== product.id)
    .slice(0, 4);
  const discount = calcDiscount(product.price, product.promo_price);
  const finalPrice = product.promo_price ?? product.price;

  return (
    <div className="bg-white">
      <div className="container-x pt-6">
        <Link
          href="/viandes"
          className="inline-flex items-center gap-1 text-sm text-ink-700 hover:text-ink-950"
        >
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>
      </div>

      <section className="container-x grid gap-10 py-8 lg:grid-cols-2 lg:py-12">
        <Reveal>
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-ink-950/[0.04] shadow-soft">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-6xl">🥩</div>
            )}
            {discount > 0 && (
              <div className="absolute left-4 top-4 rounded-full bg-gold-gradient px-3 py-1.5 text-xs font-semibold text-ink-950 shadow">
                -{discount}%
              </div>
            )}
            {product.is_featured === 1 && (
              <div className="absolute right-4 top-4 rounded-full bg-ink-950 px-3 py-1.5 text-xs font-semibold text-gold-400 shadow">
                ★ Vedette
              </div>
            )}
          </div>
        </Reveal>

        <Reveal delay={100} className="flex flex-col">
          {product.category_name && (
            <Link
              href={`/viandes?cat=${product.category_slug}`}
              className="eyebrow hover:text-gold-500"
            >
              {product.category_name}
            </Link>
          )}
          <h1 className="mt-3 font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
            {product.name}
          </h1>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-semibold">{formatPrice(finalPrice)}</span>
            {product.promo_price && (
              <span className="text-lg text-ink-700 line-through">
                {formatPrice(product.price)}
              </span>
            )}
            <span className="text-sm text-ink-700">/ kg</span>
          </div>

          {product.description && (
            <p className="mt-6 max-w-prose text-ink-800 text-balance">
              {product.description}
            </p>
          )}

          <div className="mt-8 flex items-center gap-2">
            {product.in_stock ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-900/10 px-3 py-1 text-xs font-semibold text-emerald-800">
                <Check className="h-3.5 w-3.5" /> En stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                Rupture de stock
              </span>
            )}
            {product.is_recent === 1 && (
              <span className="rounded-full bg-ink-950/5 px-3 py-1 text-xs font-medium">
                Nouveau
              </span>
            )}
          </div>

          <AddToCartButton product={product} />

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-ink-950/5 bg-ink-950/[0.02] p-3">
              <Truck className="h-4.5 w-4.5 text-gold-600" />
              <div className="mt-2 text-sm font-semibold">Livraison rapide</div>
              <div className="text-xs text-ink-700">Sous 24h à Paris</div>
            </div>
            <div className="rounded-2xl border border-ink-950/5 bg-ink-950/[0.02] p-3">
              <Award className="h-4.5 w-4.5 text-gold-600" />
              <div className="mt-2 text-sm font-semibold">Halal certifié</div>
              <div className="text-xs text-ink-700">Traçabilité totale</div>
            </div>
            <div className="rounded-2xl border border-ink-950/5 bg-ink-950/[0.02] p-3">
              <Clock className="h-4.5 w-4.5 text-gold-600" />
              <div className="mt-2 text-sm font-semibold">Fraîcheur</div>
              <div className="text-xs text-ink-700">Découpe du jour</div>
            </div>
          </div>
        </Reveal>
      </section>

      {related.length > 0 && (
        <section className="section bg-ink-950/[0.02]">
          <div className="container-x">
            <Reveal>
              <h2 className="section-title">Vous aimerez aussi</h2>
            </Reveal>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
