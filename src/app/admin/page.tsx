import { getCurrentUser } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  await getCurrentUser(); // no-op, but ensures auth lib is bundled
  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-ink-950/[0.02] py-12">
      <div className="w-full max-w-md rounded-3xl border border-ink-950/5 bg-white p-8 shadow-soft">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-950 text-gold-400 font-display">
            C
          </div>
          <div>
            <div className="font-display text-lg font-semibold">
              Espace administrateur
            </div>
            <div className="text-xs text-ink-700">Le Carrefour d'Orient</div>
          </div>
        </div>
        <LoginForm />
        <div className="mt-6 rounded-xl border border-ink-950/5 bg-ink-950/[0.02] p-3 text-xs text-ink-700">
          <strong>Démo :</strong> admin@carrefour-orient.fr / Admin2026!Secure
        </div>
      </div>
    </div>
  );
}
