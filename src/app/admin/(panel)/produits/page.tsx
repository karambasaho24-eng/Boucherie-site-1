import { getCategories, getProducts } from "@/lib/data";
import ProductsAdmin from "./ProductsAdmin";

export const dynamic = "force-dynamic";

export default function ProduitsPage() {
  const products = getProducts();
  const categories = getCategories();
  return <ProductsAdmin initialProducts={products} categories={categories} />;
}
