import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatus } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    const { id, status } = await req.json();
    if (!id || !status)
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    updateOrderStatus(Number(id), String(status));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
