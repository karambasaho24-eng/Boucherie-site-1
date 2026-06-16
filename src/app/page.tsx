import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Award, Truck, Leaf, Sparkles, Clock, MapPin, Phone } from "lucide-react";
import { getProducts, getSettings, getCategories, getReviews } from "@/lib/data";
import ProductCard from "@/components/product/ProductCard";
import Reveal from "@/components/ui/Reveal";
import { Stars } from "@/components/ui/Stars";

export default async function HomePage() {
  const settings = getSettings();
  const categories = getCategories();
  const featured = getProducts({ featured: true }).slice(0, 4);
  const recent = getProducts({ recent: true }).slice(0, 4);
  const promos = getProducts().filter((p) => p.promo_price && p.in_stock).slice(0, 3);
  const reviews = getReviews().slice(0, 4);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-gold-200/30 blur-3xl" />
          <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-emerald-900/5 blur-3xl" />
        </div>

        <div className="container-x grid gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <Reveal className="flex flex-col justify-center">
            <div className="eyebrow">{settings.site_tagline}</div>
            <h1 className="mt-4 font-display text-4xl font-medium leading-[1.05] tracking-tight text-ink-950 sm:text-5xl lg:text-6xl text-balance">
              {settings.hero_title.split("\n").map((l, i) => (
                <span key={i} className="block">
                  {i === 1 ? <span className="text-gold-shimmer">{l}</span> : l}
                </span>
              ))}
            </h1>
            <p className="mt-6 max-w-lg text-lg text-ink-700 text-balance">
              {settings.hero_subtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/viandes" className="btn-primary">
                Découvrir nos viandes
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/contact" className="btn-outline">
                Nous contacter
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-ink-950/10 pt-6">
              {[
                { value: "100%", label: "Halal certifié" },
                { value: "Local", label: "Élevages français" },
                { value: "4.9★", label: "Avis clients" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="font-display text-2xl font-semibold text-ink-950">
                    {s.value}
                  </div>
                  <div className="text-xs uppercase tracking-wider text-ink-700">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={150} className="relative">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-ink-950 shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=1200&q=80"
                alt="Boucherie Le Carrefour d'Orient"
                fill
                priority
                className="object-cover opacity-90"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/10 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-white">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold-400">
                    Depuis 1987
                  </div>
                  <div className="mt-1 font-display text-xl">La tradition, le goût</div>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 px-3 py-2 backdrop-blur">
                  <div className="text-[10px] uppercase tracking-wider text-gold-400">
                    Halal
                  </div>
                  <div className="text-sm font-semibold">Certifié</div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-6 hidden rounded-2xl bg-white p-4 shadow-soft md:flex md:items-center md:gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-900 text-white">
                <Truck className="h-4.5 w-4.5" />
              </div>
              <div>
                <div className="text-sm font-semibold">Livraison rapide</div>
                <div className="text-xs text-ink-700">Paris et banlieue</div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section bg-ink-950/[0.02]">
        <div className="container-x">
          <Reveal className="text-center">
            <div className="eyebrow">Nos univers</div>
            <h2 className="section-title mt-3">Catégories phares</h2>
            <p className="mx-auto mt-3 max-w-xl text-ink-700">
              Une sélection rigoureuse, découpée par nos maîtres bouchers.
            </p>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((c, i) => (
              <Reveal key={c.id} delay={i * 60}>
                <Link
                  href={`/viandes?cat=${c.slug}`}
                  className="group flex h-full flex-col items-center justify-center rounded-2xl border border-ink-950/5 bg-white p-5 text-center transition hover:-translate-y-1 hover:border-gold-500 hover:shadow-soft"
                >
                  <div className="text-3xl">{c.icon}</div>
                  <div className="mt-2 font-display text-base font-medium text-ink-950 group-hover:text-gold-700">
                    {c.name}
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="section">
        <div className="container-x">
          <div className="flex items-end justify-between gap-4">
            <Reveal>
              <div className="eyebrow">Vedettes</div>
              <h2 className="section-title mt-3">Produits vedettes</h2>
              <p className="mt-3 max-w-md text-ink-700">
                Nos viandes préférées, sélectionnées par nos clients.
              </p>
            </Reveal>
            <Reveal delay={150}>
              <Link
                href="/viandes"
                className="hidden items-center gap-1 text-sm font-semibold text-ink-950 hover:text-gold-700 sm:inline-flex"
              >
                Tout voir
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={i * 80}>
                <ProductCard product={p} priority={i < 2} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PROMO BANNER */}
      {promos.length > 0 && (
        <section className="bg-ink-950 text-white">
          <div className="container-x grid items-center gap-10 py-16 lg:grid-cols-2">
            <Reveal>
              <div className="eyebrow text-gold-400">Offres du moment</div>
              <h2 className="mt-3 font-display text-3xl font-medium sm:text-4xl text-balance">
                {settings.promo_title}
              </h2>
              <p className="mt-3 max-w-md text-white/70">{settings.promo_text}</p>
              <div className="mt-6 flex gap-3">
                <Link
                  href={`/viandes/${promos[0].slug}`}
                  className="btn-primary"
                >
                  Voir l'offre
                </Link>
                <Link
                  href="/viandes"
                  className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-gold-500"
                >
                  Toutes les promos
                </Link>
              </div>
            </Reveal>
            <Reveal delay={150} className="grid grid-cols-2 gap-3">
              {promos.map((p) => (
                <Link
                  key={p.id}
                  href={`/viandes/${p.slug}`}
                  className="group relative aspect-square overflow-hidden rounded-2xl bg-white/5"
                >
                  {p.image && (
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="object-cover opacity-90 transition group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="truncate text-sm font-semibold">{p.name}</div>
                    <div className="mt-0.5 text-xs">
                      <span className="text-gold-400">{p.promo_price}€</span>{" "}
                      <span className="text-white/50 line-through">{p.price}€</span>
                    </div>
                  </div>
                </Link>
              ))}
            </Reveal>
          </div>
        </section>
      )}

      {/* RECENT */}
      <section className="section">
        <div className="container-x">
          <Reveal>
            <div className="eyebrow">Nouveautés</div>
            <h2 className="section-title mt-3">Arrivages récents</h2>
            <p className="mt-3 max-w-md text-ink-700">
              Découvrez nos dernières sélections, fraîches et découpées du jour.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {recent.map((p, i) => (
              <Reveal key={p.id} delay={i * 80}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT + HOURS */}
      <section className="section bg-ink-950/[0.02]">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-ink-950 shadow-soft">
              <Image
                src="https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=1200&q=80"
                alt="Le Carrefour d'Orient"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="eyebrow">{settings.about_title}</div>
            <h2 className="section-title mt-3 text-balance">
              L'art de la boucherie halal
            </h2>
            <p className="mt-4 text-ink-700 text-balance">{settings.about_text}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                { icon: Award, title: "Qualité premium", text: "Sélection rigoureuse" },
                { icon: Leaf, title: "Halal certifié", text: "Traçabilité totale" },
                { icon: Sparkles, title: "Fraîcheur quotidienne", text: "Découpe du jour" },
                { icon: Truck, title: "Livraison rapide", text: "Paris & banlieue" },
              ].map((f) => (
                <div
                  key={f.title}
                  className="flex items-start gap-3 rounded-2xl border border-ink-950/5 bg-white p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink-950 text-gold-400">
                    <f.icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <div className="font-semibold">{f.title}</div>
                    <div className="text-sm text-ink-700">{f.text}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-ink-950/5 bg-white p-4">
                <Clock className="h-4.5 w-4.5 text-gold-600" />
                <div className="mt-2 text-sm font-semibold">Horaires</div>
                <div className="mt-1 text-xs text-ink-700">{settings.hours_week}</div>
                <div className="text-xs text-ink-700">{settings.hours_sunday}</div>
              </div>
              <div className="rounded-2xl border border-ink-950/5 bg-white p-4">
                <MapPin className="h-4.5 w-4.5 text-gold-600" />
                <div className="mt-2 text-sm font-semibold">Adresse</div>
                <div className="mt-1 text-xs text-ink-700">{settings.address}</div>
              </div>
              <div className="rounded-2xl border border-ink-950/5 bg-white p-4">
                <Phone className="h-4.5 w-4.5 text-gold-600" />
                <div className="mt-2 text-sm font-semibold">Téléphone</div>
                <div className="mt-1 text-xs text-ink-700">{settings.phone}</div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="section">
        <div className="container-x">
          <Reveal className="text-center">
            <div className="eyebrow">Ils parlent de nous</div>
            <h2 className="section-title mt-3">Avis clients</h2>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {reviews.map((r, i) => (
              <Reveal key={r.id} delay={i * 80}>
                <div className="card flex h-full flex-col p-6">
                  <Stars rating={r.rating} />
                  <p className="mt-4 flex-1 text-ink-800 text-balance">"{r.content}"</p>
                  <div className="mt-4 flex items-center gap-3 border-t border-ink-950/5 pt-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-950 text-sm font-semibold text-gold-400">
                      {r.author.charAt(0)}
                    </div>
                    <div className="text-sm font-semibold">{r.author}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink-950 py-20 text-white">
        <div className="container-x text-center">
          <Reveal>
            <h2 className="font-display text-3xl font-medium sm:text-4xl text-balance">
              Prêt à savourer l'excellence ?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-white/70">
              Commandez en ligne ou passez directement à la boucherie.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/viandes" className="btn-primary">
                Commander maintenant
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold transition hover:border-gold-500"
              >
                Trouver la boucherie
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
