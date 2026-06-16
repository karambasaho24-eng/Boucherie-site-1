import { Mail, MapPin, Phone, Clock, Send } from "lucide-react";
import { getSettings } from "@/lib/data";
import Reveal from "@/components/ui/Reveal";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const s = getSettings();
  return (
    <div className="bg-white">
      <header className="bg-ink-950/[0.02] py-12">
        <div className="container-x">
          <Reveal>
            <div className="eyebrow">Contact</div>
            <h1 className="mt-3 font-display text-4xl font-medium tracking-tight sm:text-5xl">
              On vous accueille
            </h1>
            <p className="mt-3 max-w-xl text-ink-700">
              Une question, une commande spéciale, ou simplement envie de
              discuter viande ? Écrivez-nous.
            </p>
          </Reveal>
        </div>
      </header>

      <section className="container-x grid gap-10 py-12 lg:grid-cols-5">
        <Reveal className="lg:col-span-2">
          <div className="space-y-4">
            <div className="rounded-2xl border border-ink-950/5 bg-white p-5 shadow-soft">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-950 text-gold-400">
                  <MapPin className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Adresse</div>
                  <div className="mt-1 text-sm text-ink-700">{s.address}</div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-ink-950/5 bg-white p-5 shadow-soft">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-950 text-gold-400">
                  <Phone className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Téléphone</div>
                  <a
                    href={`tel:${s.phone.replace(/\s/g, "")}`}
                    className="mt-1 text-sm text-ink-700 hover:text-gold-700"
                  >
                    {s.phone}
                  </a>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-ink-950/5 bg-white p-5 shadow-soft">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-950 text-gold-400">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Email</div>
                  <a
                    href={`mailto:${s.email}`}
                    className="mt-1 text-sm text-ink-700 hover:text-gold-700"
                  >
                    {s.email}
                  </a>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-ink-950/5 bg-white p-5 shadow-soft">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-950 text-gold-400">
                  <Clock className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Horaires</div>
                  <div className="mt-1 text-sm text-ink-700">{s.hours_week}</div>
                  <div className="text-sm text-ink-700">{s.hours_sunday}</div>
                  <div className="text-sm text-ink-700">{s.hours_monday}</div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={100} className="lg:col-span-3">
          <form
            className="rounded-2xl border border-ink-950/5 bg-white p-6 shadow-soft sm:p-8"
            action={`mailto:${s.email}`}
            method="post"
            encType="text/plain"
          >
            <h2 className="font-display text-2xl font-medium">Envoyez-nous un message</h2>
            <p className="mt-1 text-sm text-ink-700">
              Nous vous répondons sous 24h.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Nom</label>
                <input className="input" name="name" required />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" name="email" type="email" required />
              </div>
              <div>
                <label className="label">Téléphone</label>
                <input className="input" name="phone" />
              </div>
              <div>
                <label className="label">Sujet</label>
                <input className="input" name="subject" />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Message</label>
                <textarea
                  className="input min-h-[140px] resize-y"
                  name="message"
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn-primary mt-6">
              <Send className="h-4 w-4" /> Envoyer
            </button>
          </form>
        </Reveal>
      </section>
    </div>
  );
}
