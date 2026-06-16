"use client";

import { useState } from "react";
import { X, Sparkles } from "lucide-react";

export default function PromoBar({
  enabled,
  title,
  text,
}: {
  enabled: boolean;
  title: string;
  text: string;
}) {
  const [hidden, setHidden] = useState(false);
  if (!enabled || hidden) return null;
  return (
    <div className="bg-ink-950 text-white">
      <div className="container-x flex items-center justify-between gap-3 py-2 text-xs sm:text-sm">
        <div className="flex items-center gap-2 truncate">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-gold-400" />
          <span className="font-semibold uppercase tracking-wider text-gold-400">
            {title}
          </span>
          <span className="hidden text-white/70 sm:inline">—</span>
          <span className="truncate text-white/80">{text}</span>
        </div>
        <button
          onClick={() => setHidden(true)}
          className="text-white/60 transition hover:text-white"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
