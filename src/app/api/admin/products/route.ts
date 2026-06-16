import { NextRequest, NextResponse } from "next/server";
import {
  createProduct,
  deleteProduct,
  getCategories,
  updateProduct,
} from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";

async function ensureAdmin() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
}

export async function GET() {
  try {
    await ensureAdmin();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureAdmin();
    const body = await req.json();
    const name = String(body.name || "").trim();
    if (!name) return NextResponse.json({ error: "Nom requis" }, { status: 400 });
    const price = Number(body.price);
    if (!Number.isFinite(price) || price < 0)
      return NextResponse.json({ error: "Prix invalide" }, { status: 400 });

    const cats = getCategories();
    const catId = body.category_id
      ? Number(body.category_id)
      : cats.find((c) => c.slug === body.category_slug)?.id ?? null;

    const id = createProduct({
      name,
      slug: slugify(name) + "-" + Date.now().toString(36),
      description: body.description ?? "",
      price,
      promo_price:
        body.promo_price && Number(body.promo_price) > 0
          ? Number(body.promo_price)
          : null,
      category_id: catId,
      image: body.image ?? null,
      in_stock: body.in_stock ? 1 : 0,
      is_featured: body.is_featured ? 1 : 0,
      is_recent: body.is_recent ? 1 : 0,
    });
    return NextResponse.json({ id });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED")
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    return NextResponse.json(
      { error: e.message || "Erreur" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await ensureAdmin();
    const body = await req.json();
    const id = Number(body.id);
    if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });
    const update: any = {};
    if (body.name !== undefined) update.name = String(body.name);
    if (body.description !== undefined)
      update.description = String(body.description);
    if (body.price !== undefined) update.price = Number(body.price);
    if (body.promo_price !== undefined) {
      const v =
        body.promo_price === null || body.promo_price === ""
          ? null
          : Number(body.promo_price);
      update.promo_price = v;
    }
    if (body.category_id !== undefined) {
      update.category_id = body.category_id ? Number(body.category_id) : null;
    }
    if (body.image !== undefined) update.image = body.image;
    if (body.in_stock !== undefined) update.in_stock = body.in_stock ? 1 : 0;
    if (body.is_featured !== undefined)
      update.is_featured = body.is_featured ? 1 : 0;
    if (body.is_recent !== undefined)
      update.is_recent = body.is_recent ? 1 : 0;

    updateProduct(id, update);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED")
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    return NextResponse.json(
      { error: e.message || "Erreur" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await ensureAdmin();
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });
    deleteProduct(Number(id));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED")
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    return NextResponse.json(
      { error: e.message || "Erreur" },
      { status: 500 }
    );
  }
}
