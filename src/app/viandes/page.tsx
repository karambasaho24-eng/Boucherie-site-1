import Link from "next/link";
import { getCategories, getProducts } from "@/lib/data";
import ProductCard from "@/components/product/ProductCard";
import ProductsBrowser from "@/components/product/ProductsBrowser";
import Reveal from "@/components/ui/Reveal";

export const dynamic = "force-dynamic";

export default async function ViandesPage({
  searchParams,
}: {
  searchParams: { cat?: string; q?: string };
}) {
  const categories = getCategories();
  const products = getProducts({
    categorySlug: searchParams.cat,
    search: searchParams.q,
  });

  return (
    <div className="bg-white">
      <header className="border-b border-ink-950/5 bg-ink-950/[0.02] py-12">
        <div className="container-x">
          <Reveal>
            <div className="eyebrow">Catalogue</div>
            <h1 className="mt-3 font-display text-4xl font-medium tracking-tight sm:text-5xl">
              Nos viandes
            </h1>
            <p className="mt-3 max-w-xl text-ink-700">
              Filtrez par catégorie ou recherchez votre viande préférée.
              {products.length} produit{products.length > 1 ? "s" : ""} disponible
              {products.length > 1 ? "s" : ""}.
            </p>
          </Reveal>
        </div>
      </header>

      <ProductsBrowser
        categories={categories}
        products={products}
        activeCategory={searchParams.cat}
        query={searchParams.q}
      />
    </div>
  );
}
