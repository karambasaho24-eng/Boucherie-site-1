import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { getDb } from "./db";

const SECRET = process.env.JWT_SECRET || "dev-fallback-secret-change-me-now";
const COOKIE = "boucherie_session";

export type SessionPayload = {
  uid: number;
  email: string;
  role: string;
};

export function signSession(payload: SessionPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifySession(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionPayload | null> {
  const store = cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export function setSessionCookie(token: string) {
  cookies().set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearSessionCookie() {
  cookies().set(COOKIE, "", { maxAge: 0, path: "/" });
}

export async function authenticate(
  email: string,
  password: string
): Promise<SessionPayload | null> {
  const db = getDb();
  const user = db
    .prepare("SELECT * FROM users WHERE email = ? AND role = 'admin'")
    .get(email) as any;
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return null;
  return { uid: user.id, email: user.email, role: user.role };
}

export async function ensureAdmin() {
  const db = getDb();
  const email = process.env.ADMIN_EMAIL || "admin@carrefour-orient.fr";
  const password = process.env.ADMIN_PASSWORD || "Admin2026!Secure";
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) return;
  const hash = await bcrypt.hash(password, 10);
  db.prepare(
    "INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, 'admin')"
  ).run(email, hash, "Administrateur");
}
