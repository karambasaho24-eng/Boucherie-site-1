"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const TITLES: Record<string, { title: string; subtitle: string }> = {
  "/admin/dashboard": {
    title: "Tableau de bord",
    subtitle: "Vue d'ensemble de votre boucherie",
  },
  "/admin/produits": {
    title: "Gestion des viandes",
    subtitle: "Ajoutez, modifiez et organisez votre catalogue",
  },
  "/admin/commandes": {
    title: "Commandes",
    subtitle: "Suivez et gérez les commandes clients",
  },
  "/admin/personnalisation": {
    title: "Personnalisation",
    subtitle: "Modifiez les textes du site sans toucher au code",
  },
};

export function Topbar({ email }: { email: string }) {
  const pathname = usePathname() || "/admin/dashboard";
  const info =
    TITLES[pathname] ??
    Object.entries(TITLES).find(([k]) => pathname.startsWith(k))?.[1] ??
    TITLES["/admin/dashboard"];

  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-ink-950/5 bg-white p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-700">
          Administration
        </div>
        <h1 className="mt-1 font-display text-2xl font-medium sm:text-3xl">
          {info.title}
        </h1>
        <p className="mt-0.5 text-sm text-ink-700">{info.subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <Link href="/" className="btn-outline">
          <ArrowLeft className="h-3.5 w-3.5" />
          Voir le site
        </Link>
        <div className="hidden rounded-xl border border-ink-950/5 bg-ink-950/[0.02] px-3 py-2 text-xs sm:block">
          <div className="text-ink-700">Connecté</div>
          <div className="font-semibold">{email}</div>
        </div>
      </div>
    </div>
  );
}
