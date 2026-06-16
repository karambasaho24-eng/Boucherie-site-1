import { NextRequest, NextResponse } from "next/server";
import { authenticate, signSession, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Identifiants requis" },
        { status: 400 }
      );
    }
    const user = await authenticate(String(email), String(password));
    if (!user) {
      return NextResponse.json(
        { error: "Email ou mot de passe invalide" },
        { status: 401 }
      );
    }
    const token = signSession(user);
    setSessionCookie(token);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur" },
      { status: 500 }
    );
  }
}
