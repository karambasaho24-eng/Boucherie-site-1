"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X, Star, Tag, Eye, EyeOff, Sparkles } from "lucide-react";
import { Category, Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

type Form = {
  id?: number;
  name: string;
  description: string;
  price: string;
  promo_price: string;
  category_id: string;
  image: string;
  in_stock: boolean;
  is_featured: boolean;
  is_recent: boolean;
};

const emptyForm: Form = {
  name: "",
  description: "",
  price: "",
  promo_price: "",
  category_id: "",
  image: "",
  in_stock: true,
  is_featured: false,
  is_recent: false,
};

export default function ProductsAdmin({
  initialProducts,
  categories,
}: {
  initialProducts: Product[];
  categories: Category[];
}) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");

  function startNew() {
    setForm(emptyForm);
    setOpen(true);
  }

  function startEdit(p: Product) {
    setForm({
      id: p.id,
      name: p.name,
      description: p.description ?? "",
      price: String(p.price),
      promo_price: p.promo_price ? String(p.promo_price) : "",
      category_id: p.category_id ? String(p.category_id) : "",
      image: p.image ?? "",
      in_stock: !!p.in_stock,
      is_featured: !!p.is_featured,
      is_recent: !!p.is_recent,
    });
    setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const body: any = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        promo_price: form.promo_price ? Number(form.promo_price) : null,
        category_id: form.category_id ? Number(form.category_id) : null,
        image: form.image || null,
        in_stock: form.in_stock,
        is_featured: form.is_featured,
        is_recent: form.is_recent,
      };
      const res = await fetch(
        form.id ? "/api/admin/products" : "/api/admin/products",
        {
          method: form.id ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(form.id ? { id: form.id, ...body } : body),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur");
      }
      setOpen(false);
      router.refresh();
      // re-fetch
      const fresh = await fetch("/api/admin/products/list").catch(() => null);
      if (fresh && fresh.ok) {
        const data = await fresh.json();
        setProducts(data);
      } else {
        // optimistic local update
        if (form.id) {
          setProducts((arr) =>
            arr.map((p) =>
              p.id === form.id
                ? {
                    ...p,
                    name: form.name,
                    description: form.description,
                    price: Number(form.price),
                    promo_price: form.promo_price
                      ? Number(form.promo_price)
                      : null,
                    category_id: form.category_id
                      ? Number(form.category_id)
                      : null,
                    image: form.image,
                    in_stock: form.in_stock ? 1 : 0,
                    is_featured: form.is_featured ? 1 : 0,
                    is_recent: form.is_recent ? 1 : 0,
                  }
                : p
            )
          );
        }
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: number) {
    if (!confirm("Supprimer cette viande ?")) return;
    await fetch("/api/admin/products", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setProducts((arr) => arr.filter((p) => p.id !== id));
    router.refresh();
  }

  async function toggleStock(p: Product) {
    await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: p.id, in_stock: !p.in_stock }),
    });
    setProducts((arr) =>
      arr.map((x) => (x.id === p.id ? { ...x, in_stock: x.in_stock ? 0 : 1 } : x))
    );
  }

  async function toggleFeatured(p: Product) {
    await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: p.id, is_featured: !p.is_featured }),
    });
    setProducts((arr) =>
      arr.map((x) =>
        x.id === p.id ? { ...x, is_featured: x.is_featured ? 0 : 1 } : x
      )
    );
  }

  const filtered = products.filter((p) => {
    if (filterCat && String(p.category_id) !== filterCat) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <input
            className="input w-full sm:w-72"
            placeholder="Rechercher une viande..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="input w-full sm:w-56"
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
          >
            <option value="">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <button onClick={startNew} className="btn-primary">
          <Plus className="h-4 w-4" /> Ajouter une viande
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-ink-950/5 bg-white shadow-soft">
        <div className="hidden grid-cols-12 gap-4 border-b border-ink-950/5 bg-ink-950/[0.02] px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-ink-700 md:grid">
          <div className="col-span-5">Viande</div>
          <div className="col-span-2">Catégorie</div>
          <div className="col-span-2">Prix</div>
          <div className="col-span-1">Statut</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        <div className="divide-y divide-ink-950/5">
          {filtered.length === 0 && (
            <div className="p-10 text-center text-ink-700">Aucun produit.</div>
          )}
          {filtered.map((p) => (
            <div
              key={p.id}
              className="grid grid-cols-1 gap-3 p-4 md:grid-cols-12 md:items-center md:gap-4"
            >
              <div className="col-span-5 flex items-center gap-3">
                <div
                  className="h-14 w-14 shrink-0 rounded-xl bg-ink-950/5"
                  style={{
                    backgroundImage: p.image ? `url(${p.image})` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <div className="min-w-0">
                  <div className="truncate font-semibold">{p.name}</div>
                  <div className="line-clamp-1 text-xs text-ink-700">
                    {p.description}
                  </div>
                </div>
              </div>
              <div className="col-span-2 text-sm">
                {p.category_name || "—"}
              </div>
              <div className="col-span-2 text-sm">
                <div className="font-semibold">
                  {formatPrice(p.promo_price ?? p.price)}
                </div>
                {p.promo_price && (
                  <div className="text-xs text-ink-700 line-through">
                    {formatPrice(p.price)}
                  </div>
                )}
              </div>
              <div className="col-span-1">
                <button
                  onClick={() => toggleStock(p)}
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                    p.in_stock
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {p.in_stock ? "En stock" : "Rupture"}
                </button>
              </div>
              <div className="col-span-2 flex justify-end gap-1">
                <button
                  onClick={() => toggleFeatured(p)}
                  className="rounded-full border border-ink-950/10 p-2 text-ink-800 hover:border-gold-500 hover:text-gold-700"
                  title="Vedette"
                >
                  <Star
                    className="h-4 w-4"
                    fill={p.is_featured ? "currentColor" : "none"}
                  />
                </button>
                <button
                  onClick={() => startEdit(p)}
                  className="rounded-full border border-ink-950/10 p-2 text-ink-800 hover:border-gold-500 hover:text-gold-700"
                  title="Modifier"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => remove(p.id)}
                  className="rounded-full border border-ink-950/10 p-2 text-ink-800 hover:border-red-500 hover:text-red-600"
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">
                {form.id ? "Modifier la viande" : "Ajouter une viande"}
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 text-ink-700 hover:bg-ink-950/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={save} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="label">Nom *</label>
                  <input
                    className="input"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="label">Prix (€) *</label>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="label">Prix promo (€)</label>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.promo_price}
                    onChange={(e) =>
                      setForm({ ...form, promo_price: e.target.value })
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Catégorie</label>
                  <select
                    className="input"
                    value={form.category_id}
                    onChange={(e) =>
                      setForm({ ...form, category_id: e.target.value })
                    }
                  >
                    <option value="">Sans catégorie</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="label">URL de la photo</label>
                  <input
                    className="input"
                    value={form.image}
                    onChange={(e) =>
                      setForm({ ...form, image: e.target.value })
                    }
                    placeholder="https://..."
                  />
                  {form.image && (
                    <div className="mt-2 h-32 w-32 overflow-hidden rounded-xl border border-ink-950/5">
                      <img
                        src={form.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Description</label>
                  <textarea
                    className="input min-h-[100px] resize-y"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-ink-950/5 bg-ink-950/[0.02] p-4 text-sm">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.in_stock}
                    onChange={(e) =>
                      setForm({ ...form, in_stock: e.target.checked })
                    }
                  />
                  En stock
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) =>
                      setForm({ ...form, is_featured: e.target.checked })
                    }
                  />
                  <Star className="h-3.5 w-3.5" /> Vedette
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.is_recent}
                    onChange={(e) =>
                      setForm({ ...form, is_recent: e.target.checked })
                    }
                  />
                  <Sparkles className="h-3.5 w-3.5" /> Récent
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn-outline"
                >
                  Annuler
                </button>
                <button disabled={loading} className="btn-primary">
                  {loading ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
