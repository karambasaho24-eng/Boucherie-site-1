"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import { Category, Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function ProductsBrowser({
  categories,
  products,
  activeCategory,
  query,
}: {
  categories: Category[];
  products: Product[];
  activeCategory?: string;
  query?: string;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [sort, setSort] = useState<"popular" | "recent" | "price-asc" | "price-desc">(
    "popular"
  );
  const [search, setSearch] = useState(query ?? "");

  useEffect(() => {
    setSearch(query ?? "");
  }, [query]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          (p.description ?? "").toLowerCase().includes(s)
      );
    }
    switch (sort) {
      case "recent":
        list.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
        break;
      case "price-asc":
        list.sort(
          (a, b) =>
            (a.promo_price ?? a.price) - (b.promo_price ?? b.price)
        );
        break;
      case "price-desc":
        list.sort(
          (a, b) =>
            (b.promo_price ?? b.price) - (a.promo_price ?? a.price)
        );
        break;
      default:
        list.sort(
          (a, b) =>
            Number(b.is_featured) - Number(a.is_featured) ||
            b.views - a.views
        );
    }
    return list;
  }, [products, search, sort]);

  function buildHref(slug?: string) {
    const params = new URLSearchParams(sp.toString());
    if (slug) params.set("cat", slug);
    else params.delete("cat");
    const q = params.toString();
    return `/viandes${q ? "?" + q : ""}`;
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(sp.toString());
    if (search) params.set("q", search);
    else params.delete("q");
    router.push(`/viandes${params.toString() ? "?" + params.toString() : ""}`);
  }

  return (
    <div className="container-x py-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={buildHref()}
            className={cn("chip", !activeCategory && "chip-active")}
          >
            Toutes
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={buildHref(c.slug)}
              className={cn(
                "chip",
                activeCategory === c.slug && "chip-active"
              )}
            >
              <span>{c.icon}</span> {c.name}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <form onSubmit={submitSearch} className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-700/50" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une viande..."
              className="input w-full pl-9 sm:w-72"
            />
          </form>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="input w-full sm:w-48"
          >
            <option value="popular">Les plus populaires</option>
            <option value="recent">Les plus récents</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-950/10 py-20 text-center">
          <div className="text-4xl">🔎</div>
          <h3 className="mt-3 font-display text-xl">Aucun produit trouvé</h3>
          <p className="mt-1 max-w-sm text-sm text-ink-700">
            Essayez d'élargir vos filtres ou de chercher un autre terme.
          </p>
          <Link href="/viandes" className="btn-primary mt-5">
            Réinitialiser
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 4} />
          ))}
        </div>
      )}
    </div>
  );
}
