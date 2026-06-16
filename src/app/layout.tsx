import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/providers/CartProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import PromoBar from "@/components/layout/PromoBar";
import ScrollTop from "@/components/ui/ScrollTop";
import { getSettings } from "@/lib/data";
import { bootstrap } from "@/lib/bootstrap";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Le Carrefour d'Orient — Boucherie Halal Premium",
  description:
    "Boucherie halal premium : bœuf, agneau, poulet, brochettes, merguez et packs barbecue. Qualité, fraîcheur et tradition.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await bootstrap();
  const settings = getSettings();
  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-white text-ink-950 antialiased">
        <CartProvider>
          <ScrollTop />
          <PromoBar
            enabled={settings.promo_active === "1"}
            title={settings.promo_title}
            text={settings.promo_text}
          />
          <Navbar siteTitle={settings.site_title} />
          <main className="min-h-[60vh]">{children}</main>
          <Footer settings={settings} />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
