"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, ShoppingBag, Phone } from "lucide-react";
import { useCartStore } from "@/components/providers/CartDrawerProvider";
import { useCart, selectCount } from "@/store/cart";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Accueil" },
  { href: "/viandes", label: "Nos viandes" },
  { href: "/a-propos", label: "La boucherie" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar({ siteTitle }: { siteTitle: string }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const cart = useCartStore();
  const count = useCart((s) => selectCount(s));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled
          ? "bg-white/90 backdrop-blur-md border-b border-ink-950/5"
          : "bg-white/60 backdrop-blur-sm"
      )}
    >
      <div className="container-x flex h-16 items-center justify-between lg:h-20">
        <Link href="/" className="group flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-950 text-gold-400 transition-transform group-hover:rotate-12">
            <span className="font-display text-lg">C</span>
          </span>
          <div className="leading-none">
            <div className="font-display text-base font-semibold text-ink-950 sm:text-lg">
              {siteTitle}
            </div>
            <div className="hidden text-[10px] uppercase tracking-[0.3em] text-gold-700 sm:block">
              Boucherie Halal
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-ink-800 transition hover:bg-ink-950/5 hover:text-ink-950"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="tel:0123456789"
            className="hidden items-center gap-2 rounded-full border border-ink-950/10 px-3 py-2 text-xs font-medium text-ink-800 transition hover:border-gold-500 hover:text-gold-700 md:inline-flex"
          >
            <Phone className="h-3.5 w-3.5" />
            01 23 45 67 89
          </a>
          <button
            onClick={cart.toggle}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-ink-950 text-white transition hover:bg-ink-800"
            aria-label="Panier"
          >
            <ShoppingBag className="h-4.5 w-4.5" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gold-gradient px-1 text-[10px] font-semibold text-ink-950 shadow">
                {count}
              </span>
            )}
          </button>
          <button
            onClick={() => setOpen((s) => !s)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink-950/10 text-ink-950 transition hover:border-gold-500 lg:hidden"
            aria-label="Menu"
          >
            {open ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "lg:hidden overflow-hidden border-t border-ink-950/5 bg-white transition-[max-height] duration-300",
          open ? "max-h-96" : "max-h-0"
        )}
      >
        <nav className="container-x flex flex-col py-3">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-sm font-medium text-ink-800 transition hover:bg-ink-950/5"
            >
              {n.label}
            </Link>
          ))}
          <a
            href="tel:0123456789"
            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-ink-950 px-3 py-3 text-sm font-medium text-white"
          >
            <Phone className="h-4 w-4" />
            Appeler la boucherie
          </a>
        </nav>
      </div>
    </header>
  );
}
