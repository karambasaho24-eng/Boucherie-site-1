"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Beef,
  ShoppingCart,
  Settings,
  LogOut,
  X,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/produits", label: "Viandes", icon: Beef },
  { href: "/admin/commandes", label: "Commandes", icon: ShoppingCart },
  { href: "/admin/personnalisation", label: "Personnalisation", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-40 inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink-950/10 bg-white shadow-soft lg:hidden"
        aria-label="Menu"
      >
        <Menu className="h-4.5 w-4.5" />
      </button>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 -translate-x-full border-r border-ink-950/5 bg-white p-5 transition-transform lg:static lg:translate-x-0",
          open && "translate-x-0"
        )}
      >
        <div className="flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-950 text-gold-400 font-display">
              C
            </div>
            <div className="leading-tight">
              <div className="font-display text-sm font-semibold">
                Admin · Carrefour
              </div>
              <div className="text-[10px] uppercase tracking-wider text-gold-700">
                v1.0
              </div>
            </div>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="rounded-full p-1.5 text-ink-700 hover:bg-ink-950/5 lg:hidden"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="mt-6 space-y-1">
          {ITEMS.map((it) => {
            const active = pathname?.startsWith(it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-ink-950 text-white"
                    : "text-ink-800 hover:bg-ink-950/5"
                )}
              >
                <it.icon className="h-4 w-4" />
                {it.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-ink-950/5 bg-ink-950/[0.02] p-3">
          <div className="text-xs text-ink-700">Connecté en tant qu'admin</div>
          <button
            onClick={logout}
            className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-ink-950/10 bg-white py-2 text-xs font-semibold text-ink-950 hover:border-gold-500"
          >
            <LogOut className="h-3.5 w-3.5" /> Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}
