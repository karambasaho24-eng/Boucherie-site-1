import Link from "next/link";
import { Mail, MapPin, Phone, Facebook, Instagram } from "lucide-react";

type Settings = Record<string, string>;

export default function Footer({ settings }: { settings: Settings }) {
  return (
    <footer className="bg-ink-950 text-white">
      <div className="container-x py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-gradient text-ink-950 font-display text-lg">
                C
              </span>
              <div>
                <div className="font-display text-lg font-semibold">
                  {settings.site_title}
                </div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-gold-400">
                  {settings.site_tagline}
                </div>
              </div>
            </div>
            <p className="mt-4 max-w-xs text-sm text-white/60">
              {settings.footer_tagline}
            </p>
            <div className="mt-5 flex gap-2">
              <a
                href="#"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:border-gold-500 hover:text-gold-400"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:border-gold-500 hover:text-gold-400"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gold-400">
              Navigation
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li>
                <Link href="/" className="hover:text-gold-400">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/viandes" className="hover:text-gold-400">
                  Nos viandes
                </Link>
              </li>
              <li>
                <Link href="/a-propos" className="hover:text-gold-400">
                  La boucherie
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gold-400">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-gold-400">
                  Espace admin
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gold-400">
              Catégories
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              {["boeuf", "poulet", "agneau", "brochettes", "merguez", "barbecue"].map(
                (c) => (
                  <li key={c}>
                    <Link
                      href={`/viandes?cat=${c}`}
                      className="capitalize hover:text-gold-400"
                    >
                      {c === "merguez" ? "Merguez" : c}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gold-400">
              Contact
            </h4>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-gold-400" />
                <span>{settings.address}</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 text-gold-400" />
                <span>{settings.phone}</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 text-gold-400" />
                <span>{settings.email}</span>
              </li>
            </ul>
            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/70">
              <div className="font-medium text-white">{settings.hours_week}</div>
              <div className="mt-1">{settings.hours_sunday}</div>
              <div className="mt-1">{settings.hours_monday}</div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/50 md:flex-row">
          <div>© {new Date().getFullYear()} {settings.site_title}. Tous droits réservés.</div>
          <div>Boucherie artisanale • Halal certifié • Fraîcheur garantie</div>
        </div>
      </div>
    </footer>
  );
}
