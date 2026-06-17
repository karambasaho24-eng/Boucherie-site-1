import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/providers/CartProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import PromoBar from "@/components/layout/PromoBar";
import ScrollTop from "@/components/ui/ScrollTop";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = {
    promo_active: "0",
    promo_title: "",
    promo_text: "",
    site_title: "Le Carrefour d'Orient",
  };

  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-white text-ink-950 antialiased">
        <CartProvider>
          <ScrollTop />

          <PromoBar
            enabled={false}
            title=""
            text=""
          />

          <Navbar siteTitle={settings.site_title} />

          <main className="min-h-[60vh]">{children}</main>

          <Footer settings={{}} />

          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}