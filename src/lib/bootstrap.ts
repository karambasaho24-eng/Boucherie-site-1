import { getDb } from "./db";
import { seedDatabase } from "./seed";
import { ensureAdmin } from "./auth";

let initialized = false;

export async function bootstrap() {
  if (initialized) return;
  const db = getDb();
  // Init core tables are handled in db.ts getDb(); here we seed and ensure admin.
  seedDatabase();
  await ensureAdmin();
  initialized = true;
}
