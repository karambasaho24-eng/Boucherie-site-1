import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

declare global {
  // eslint-disable-next-line no-var
  var __supabase_admin__: SupabaseClient | undefined;
  // eslint-disable-next-line no-var
  var __supabase_anon__: SupabaseClient | undefined;
}

function missingEnvMessage() {
  return (
    "[supabase] Variables d'environnement manquantes. " +
    "Vérifiez NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY (ou NEXT_PUBLIC_SUPABASE_ANON_KEY) dans .env.local."
  );
}

/**
 * Client Supabase côté serveur utilisant la service_role key.
 * Bypass le Row Level Security. À utiliser uniquement dans les API routes,
 * Server Components et Server Actions (jamais côté client).
 */
export const supabaseAdmin: SupabaseClient =
  globalThis.__supabase_admin__ ??
  createClient(SUPABASE_URL || "http://localhost", SERVICE_ROLE_KEY || "missing", {
    auth: { persistSession: false, autoRefreshToken: false },
  });

if (!globalThis.__supabase_admin__) {
  globalThis.__supabase_admin__ = supabaseAdmin;
}

/**
 * Client Supabase public (anon key) — utilisable côté client si besoin.
 * Les policies RLS s'appliquent. Pour l'instant le projet ne s'en sert pas
 * côté navigateur mais on l'expose pour des usages futurs.
 */
export const supabaseAnon: SupabaseClient =
  globalThis.__supabase_anon__ ??
  createClient(SUPABASE_URL || "http://localhost", ANON_KEY || "missing", {
    auth: { persistSession: false, autoRefreshToken: false },
  });

if (!globalThis.__supabase_anon__) {
  globalThis.__supabase_anon__ = supabaseAnon;
}

/**
 * Vérifie à l'exécution que les variables d'env sont présentes.
 * Lève une erreur explicite au premier appel DB si elles manquent,
 * au lieu de faire échouer silencieusement chaque query.
 */
export function assertSupabaseEnv() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new Error(missingEnvMessage());
  }
}
