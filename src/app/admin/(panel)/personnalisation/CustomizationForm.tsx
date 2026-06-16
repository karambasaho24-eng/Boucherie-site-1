"use client";

import { useState } from "react";
import { Save, Check } from "lucide-react";

const FIELDS: {
  key: string;
  label: string;
  type: "text" | "textarea";
  help?: string;
}[] = [
  { key: "site_title", label: "Titre du site", type: "text" },
  { key: "site_tagline", label: "Sous-titre du site", type: "text" },
  { key: "site_subtitle", label: "Description du site", type: "textarea" },
  { key: "hero_title", label: "Titre page d'accueil", type: "textarea" },
  { key: "hero_subtitle", label: "Sous-titre page d'accueil", type: "textarea" },
  { key: "about_title", label: "Titre « À propos »", type: "text" },
  { key: "about_text", label: "Texte « À propos »", type: "textarea" },
  { key: "address", label: "Adresse", type: "text" },
  { key: "phone", label: "Téléphone", type: "text" },
  { key: "email", label: "Email", type: "text" },
  { key: "hours_week", label: "Horaires semaine", type: "text" },
  { key: "hours_sunday", label: "Horaires dimanche", type: "text" },
  { key: "hours_monday", label: "Horaires lundi", type: "text" },
  { key: "promo_active", label: "Bandeau promo actif (1 = oui)", type: "text" },
  { key: "promo_title", label: "Titre promo", type: "text" },
  { key: "promo_text", label: "Texte promo", type: "text" },
  { key: "footer_tagline", label: "Texte du footer", type: "textarea" },
];

export default function CustomizationForm({
  initial,
}: {
  initial: Record<string, string>;
}) {
  const [values, setValues] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function save() {
    setLoading(true);
    setDone(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Erreur");
      setDone(true);
      setTimeout(() => setDone(false), 2500);
    } catch {
      alert("Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-ink-950/5 bg-white p-6 shadow-soft">
        <h2 className="font-display text-lg font-medium">Textes du site</h2>
        <p className="mt-1 text-sm text-ink-700">
          Modifiez les textes affichés sur le site. Les changements sont
          visibles immédiatement sur la partie cliente.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {FIELDS.map((f) => (
            <div
              key={f.key}
              className={f.type === "textarea" ? "sm:col-span-2" : ""}
            >
              <label className="label">{f.label}</label>
              {f.type === "textarea" ? (
                <textarea
                  className="input min-h-[100px] resize-y"
                  value={values[f.key] ?? ""}
                  onChange={(e) =>
                    setValues({ ...values, [f.key]: e.target.value })
                  }
                />
              ) : (
                <input
                  className="input"
                  value={values[f.key] ?? ""}
                  onChange={(e) =>
                    setValues({ ...values, [f.key]: e.target.value })
                  }
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-ink-950/5 pt-4">
          {done ? (
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">
              <Check className="h-4 w-4" /> Modifications enregistrées
            </span>
          ) : (
            <span className="text-sm text-ink-700">
              Pensez à enregistrer vos modifications.
            </span>
          )}
          <button
            disabled={loading}
            onClick={save}
            className="btn-primary"
          >
            <Save className="h-4 w-4" />{" "}
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
