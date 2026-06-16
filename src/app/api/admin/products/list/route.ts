import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getProducts } from "@/lib/data";

export async function GET() {
  const u = await getCurrentUser();
  if (!u) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  return NextResponse.json(getProducts());
}
