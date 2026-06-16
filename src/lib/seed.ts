// Données de seed pour la boucherie
import { getDb } from "./db";

export const SEED_CATEGORIES = [
  { slug: "boeuf", name: "Bœuf", icon: "🥩", sort_order: 1 },
  { slug: "poulet", name: "Poulet", icon: "🍗", sort_order: 2 },
  { slug: "agneau", name: "Agneau", icon: "🐑", sort_order: 3 },
  { slug: "brochettes", name: "Brochettes", icon: "🍢", sort_order: 4 },
  { slug: "merguez", name: "Merguez", icon: "🌭", sort_order: 5 },
  { slug: "barbecue", name: "Barbecue", icon: "🔥", sort_order: 6 },
];

export const SEED_PRODUCTS = [
  {
    name: "Entrecôte de Bœuf",
    slug: "entrecote-boeuf",
    description:
      "Entrecôte de bœuf halal, persillée et tendre. Idéale pour une grillade savoureuse en famille.",
    price: 32.9,
    promo_price: 27.9,
    category_slug: "boeuf",
    image:
      "https://images.unsplash.com/photo-1603048297172-c92544798d2e?w=900&q=80",
    is_featured: 1,
    is_recent: 0,
  },
  {
    name: "Faux-filet de Bœuf",
    slug: "faux-filet-boeuf",
    description:
      "Faux-filet maturé, découpe soignée par nos bouchers. Saveur profonde et texture fondante.",
    price: 28.5,
    promo_price: null,
    category_slug: "boeuf",
    image:
      "https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=900&q=80",
    is_featured: 1,
    is_recent: 0,
  },
  {
    name: "Poulet Fermier Entier",
    slug: "poulet-fermier",
    description:
      "Poulet fermier élevé en plein air, nourri sans OGM. Chair ferme et goût authentique.",
    price: 12.9,
    promo_price: 9.9,
    category_slug: "poulet",
    image:
      "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=900&q=80",
    is_featured: 1,
    is_recent: 1,
  },
  {
    name: "Cuisses de Poulet",
    slug: "cuisses-poulet",
    description:
      "Cuisses de poulet halal, parfaites pour tajine, rôti ou grillades. Découpées du jour.",
    price: 8.5,
    promo_price: null,
    category_slug: "poulet",
    image:
      "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=900&q=80",
    is_featured: 0,
    is_recent: 1,
  },
  {
    name: "Épaule d'Agneau",
    slug: "epaule-agneau",
    description:
      "Épaule d'agneau désossée, marinée aux herbes orientales. Idéale pour un plat festif.",
    price: 24.9,
    promo_price: 21.9,
    category_slug: "agneau",
    image:
      "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=900&q=80",
    is_featured: 1,
    is_recent: 0,
  },
  {
    name: "Côtelettes d'Agneau",
    slug: "cotelettes-agneau",
    description:
      "Côtelettes d'agneau tendres et savoureuses. Cuisson rapide au grill ou à la poêle.",
    price: 29.9,
    promo_price: null,
    category_slug: "agneau",
    image:
      "https://images.unsplash.com/photo-1574484284002-952d92456975?w=900&q=80",
    is_featured: 0,
    is_recent: 1,
  },
  {
    name: "Brochettes Mixtes",
    slug: "brochettes-mixtes",
    description:
      "Brochettes marinées bœuf et agneau, avec oignons et poivrons. Prêtes à griller.",
    price: 15.9,
    promo_price: 13.5,
    category_slug: "brochettes",
    image:
      "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=900&q=80",
    is_featured: 1,
    is_recent: 1,
  },
  {
    name: "Brochettes de Poulet",
    slug: "brochettes-poulet",
    description:
      "Brochettes de poulet marinées au citron et épices orientales. Moelleuses et parfumées.",
    price: 12.9,
    promo_price: null,
    category_slug: "brochettes",
    image:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=900&q=80",
    is_featured: 0,
    is_recent: 1,
  },
  {
    name: "Merguez Artisanales",
    slug: "merguez-artisanales",
    description:
      "Merguez artisanales préparées par notre boucher. Épices orientales, goût authentique.",
    price: 13.9,
    promo_price: 11.5,
    category_slug: "merguez",
    image:
      "https://images.unsplash.com/photo-1606851094291-6efae152bb87?w=900&q=80",
    is_featured: 1,
    is_recent: 0,
  },
  {
    name: "Merguez Doux x8",
    slug: "merguez-doux",
    description:
      "Merguez douces, idéales pour toute la famille. Sachet de 8 pièces, sous vide.",
    price: 11.9,
    promo_price: null,
    category_slug: "merguez",
    image:
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=900&q=80",
    is_featured: 0,
    is_recent: 1,
  },
  {
    name: "Pack Barbecue Royal",
    slug: "pack-bbq-royal",
    description:
      "Pack complet : 2 entrecôtes, 4 brochettes, 6 merguez, 4 côtelettes d'agneau. Le best-of.",
    price: 79.9,
    promo_price: 64.9,
    category_slug: "barbecue",
    image:
      "https://images.unsplash.com/photo-1558030006-450675393462?w=900&q=80",
    is_featured: 1,
    is_recent: 1,
  },
  {
    name: "Pack Barbecue Famille",
    slug: "pack-bbq-famille",
    description:
      "Le pack idéal pour un repas convivial : brochettes, poulet, merguez, agneau.",
    price: 49.9,
    promo_price: 42.9,
    category_slug: "barbecue",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=900&q=80",
    is_featured: 1,
    is_recent: 0,
  },
];

export const SEED_REVIEWS = [
  {
    author: "Karim B.",
    rating: 5,
    content:
      "Une boucherie exceptionnelle ! La viande est toujours fraîche et le service est irréprochable. Je recommande à 100%.",
  },
  {
    author: "Sarah M.",
    rating: 5,
    content:
      "Le meilleur poulet fermier que j'ai goûté. Accueil chaleureux et conseils précieux du boucher.",
  },
  {
    author: "Mohamed T.",
    rating: 5,
    content:
      "Le pack barbecue royal est une tuerie. Tout était parfait pour notre fête en famille.",
  },
  {
    author: "Lina A.",
    rating: 5,
    content:
      "De la qualité halal au top, on retrouve le goût d'antan. Bravo à toute l'équipe !",
  },
  {
    author: "Yacine R.",
    rating: 5,
    content:
      "Service rapide, conseils avisés et viande de très grande qualité. Le Carrefour d'Orient est devenu ma boucherie de référence.",
  },
];

export const SEED_SETTINGS: Record<string, string> = {
  site_title: "Le Carrefour d'Orient",
  site_tagline: "Boucherie Halal Premium",
  site_subtitle:
    "L'excellence de la viande halal, sélectionnée avec passion et découpée par nos maîtres bouchers.",
  hero_title: "L'excellence halal,\nservie avec passion",
  hero_subtitle:
    "Découvrez une boucherie d'exception où qualité, fraîcheur et savoir-faire oriental se rencontrent.",
  about_title: "Un savoir-faire transmis depuis des générations",
  about_text:
    "Au Carrefour d'Orient, nous perpétuons la tradition d'une boucherie halal d'exception. Chaque pièce est soigneusement sélectionnée, maturée et découpée par nos artisans bouchers. Nous travaillons en direct avec des éleveurs locaux pour vous garantir une traçabilité totale et une qualité irréprochable.",
  address: "12 rue des Saveurs, 75011 Paris",
  phone: "01 23 45 67 89",
  email: "contact@carrefour-orient.fr",
  hours_week: "Mardi – Samedi : 8h00 – 20h00",
  hours_sunday: "Dimanche : 9h00 – 14h00",
  hours_monday: "Lundi : Fermé",
  promo_active: "1",
  promo_title: "Promotion de la semaine",
  promo_text: "-15% sur les packs barbecue jusqu'à dimanche",
  footer_tagline:
    "Boucherie halal premium — qualité, fraîcheur et tradition depuis 1987.",
};

export function seedDatabase() {
  const db = getDb();

  // Categories
  const catStmt = db.prepare(
    "INSERT OR IGNORE INTO categories (slug, name, icon, sort_order) VALUES (?, ?, ?, ?)"
  );
  for (const c of SEED_CATEGORIES) {
    catStmt.run(c.slug, c.name, c.icon, c.sort_order);
  }

  // Products
  const prodStmt = db.prepare(
    `INSERT OR IGNORE INTO products
     (name, slug, description, price, promo_price, category_id, image, is_featured, is_recent)
     VALUES (?, ?, ?, ?, ?, (SELECT id FROM categories WHERE slug = ?), ?, ?, ?)`
  );
  for (const p of SEED_PRODUCTS) {
    prodStmt.run(
      p.name,
      p.slug,
      p.description,
      p.price,
      p.promo_price,
      p.category_slug,
      p.image,
      p.is_featured,
      p.is_recent
    );
  }

  // Reviews
  const reviewStmt = db.prepare(
    "INSERT OR IGNORE INTO reviews (id, author, rating, content, approved) VALUES ((SELECT MAX(id)+1 FROM reviews), ?, ?, ?, 1)"
  );
  for (const r of SEED_REVIEWS) {
    db.prepare(
      "INSERT INTO reviews (author, rating, content, approved) VALUES (?, ?, ?, 1)"
    ).run(r.author, r.rating, r.content);
  }

  // Settings
  const setStmt = db.prepare(
    "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)"
  );
  for (const [k, v] of Object.entries(SEED_SETTINGS)) {
    setStmt.run(k, v);
  }
}
