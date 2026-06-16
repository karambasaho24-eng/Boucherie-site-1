import { NextRequest, NextResponse } from "next/server";
import { getSettings, updateSetting } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";

const ALLOWED = new Set([
  "site_title",
  "site_tagline",
  "site_subtitle",
  "hero_title",
  "hero_subtitle",
  "about_title",
  "about_text",
  "address",
  "phone",
  "email",
  "hours_week",
  "hours_sunday",
  "hours_monday",
  "promo_active",
  "promo_title",
  "promo_text",
  "footer_tagline",
]);

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    return NextResponse.json(getSettings());
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    const body = await req.json();
    for (const [k, v] of Object.entries(body)) {
      if (!ALLOWED.has(k)) continue;
      updateSetting(k, String(v ?? ""));
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
