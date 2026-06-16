import { NextRequest, NextResponse } from "next/server";
import { createOrder, getProductById } from "@/lib/data";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.customer_name || !body?.customer_phone) {
      return NextResponse.json(
        { error: "Nom et téléphone requis" },
        { status: 400 }
      );
    }
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "Panier vide" }, { status: 400 });
    }
    // Recompute total server-side to avoid tampering
    let total = 0;
    const items = [];
    for (const it of body.items) {
      const p = getProductById(Number(it.product_id));
      const price = p ? (p.promo_price ?? p.price) : Number(it.unit_price);
      const qty = Math.max(1, Math.floor(Number(it.quantity)));
      total += price * qty;
      items.push({
        product_id: Number(it.product_id),
        product_name: p ? p.name : String(it.product_name),
        unit_price: price,
        quantity: qty,
      });
    }
    if (total <= 0) {
      return NextResponse.json({ error: "Total invalide" }, { status: 400 });
    }
    const id = createOrder({
      customer_name: String(body.customer_name).slice(0, 100),
      customer_phone: String(body.customer_phone).slice(0, 50),
      customer_email: body.customer_email
        ? String(body.customer_email).slice(0, 200)
        : undefined,
      customer_address: body.customer_address
        ? String(body.customer_address).slice(0, 300)
        : undefined,
      notes: body.notes ? String(body.notes).slice(0, 500) : undefined,
      items,
      total,
    });
    return NextResponse.json({ id, total });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
