import Image from "next/image";
import { Award, Heart, Leaf, Sparkles, Users } from "lucide-react";
import { getSettings } from "@/lib/data";
import Reveal from "@/components/ui/Reveal";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const s = getSettings();
  return (
    <div className="bg-white">
      <header className="bg-ink-950/[0.02] py-12">
        <div className="container-x">
          <Reveal>
            <div className="eyebrow">Notre histoire</div>
            <h1 className="mt-3 font-display text-4xl font-medium tracking-tight sm:text-5xl">
              {s.about_title}
            </h1>
            <p className="mt-3 max-w-2xl text-ink-700">{s.about_text}</p>
          </Reveal>
        </div>
      </header>

      <section className="container-x grid items-center gap-10 py-16 lg:grid-cols-2">
        <Reveal>
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-ink-950 shadow-soft">
            <Image
              src="https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=1200&q=80"
              alt="Boucher au travail"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="section-title">Notre philosophie</h2>
          <p className="mt-4 text-ink-700">
            Nous travaillons main dans la main avec des éleveurs sélectionnés
            pour la qualité de leur bétail. Chaque carcasse est inspectée,
            maturait et découpée avec soin dans notre atelier à Paris.
          </p>
          <div className="mt-6 space-y-4">
            {[
              {
                icon: Award,
                title: "Excellence",
                text: "Une exigence de qualité à toutes les étapes.",
              },
              {
                icon: Leaf,
                title: "Halal & traçabilité",
                text: "Une certification rigoureuse et une traçabilité totale.",
              },
              {
                icon: Heart,
                title: "Passion",
                text: "L'amour du métier, transmis de génération en génération.",
              },
              {
                icon: Users,
                title: "Proximité",
                text: "Des conseils personnalisés à chaque client.",
              },
              {
                icon: Sparkles,
                title: "Fraîcheur",
                text: "Une découpe quotidienne, jamais congelée.",
              },
            ].map((v) => (
              <div key={v.title} className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-950 text-gold-400">
                  <v.icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold">{v.title}</div>
                  <div className="text-sm text-ink-700">{v.text}</div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>
    </div>
  );
}
