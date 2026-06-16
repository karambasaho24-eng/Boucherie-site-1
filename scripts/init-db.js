// Init script — crée la base SQLite, exécute le seed et le compte admin
// Usage: npm run db:init
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, "boucherie.db");
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'admin',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    icon TEXT,
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    promo_price REAL,
    category_id INTEGER,
    image TEXT,
    in_stock INTEGER DEFAULT 1,
    is_featured INTEGER DEFAULT 0,
    is_recent INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    customer_address TEXT,
    notes TEXT,
    total REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    unit_price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    content TEXT NOT NULL,
    approved INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Seed categories
const CATS = [
  { slug: "boeuf", name: "Bœuf", icon: "🥩", sort_order: 1 },
  { slug: "poulet", name: "Poulet", icon: "🍗", sort_order: 2 },
  { slug: "agneau", name: "Agneau", icon: "🐑", sort_order: 3 },
  { slug: "brochettes", name: "Brochettes", icon: "🍢", sort_order: 4 },
  { slug: "merguez", name: "Merguez", icon: "🌭", sort_order: 5 },
  { slug: "barbecue", name: "Barbecue", icon: "🔥", sort_order: 6 },
];

const catStmt = db.prepare(
  "INSERT OR IGNORE INTO categories (slug, name, icon, sort_order) VALUES (?, ?, ?, ?)"
);
for (const c of CATS) catStmt.run(c.slug, c.name, c.icon, c.sort_order);

const PRODUCTS = [
  { name: "Entrecôte de Bœuf", slug: "entrecote-boeuf",
    desc: "Entrecôte de bœuf halal, persillée et tendre. Idéale pour une grillade savoureuse en famille.",
    price: 32.9, promo: 27.9, cat: "boeuf",
    img: "https://images.unsplash.com/photo-1603048297172-c92544798d2e?w=900&q=80",
    featured: 1, recent: 0 },
  { name: "Faux-filet de Bœuf", slug: "faux-filet-boeuf",
    desc: "Faux-filet maturé, découpe soignée par nos bouchers. Saveur profonde et texture fondante.",
    price: 28.5, promo: null, cat: "boeuf",
    img: "https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=900&q=80",
    featured: 1, recent: 0 },
  { name: "Poulet Fermier Entier", slug: "poulet-fermier",
    desc: "Poulet fermier élevé en plein air, nourri sans OGM. Chair ferme et goût authentique.",
    price: 12.9, promo: 9.9, cat: "poulet",
    img: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=900&q=80",
    featured: 1, recent: 1 },
  { name: "Cuisses de Poulet", slug: "cuisses-poulet",
    desc: "Cuisses de poulet halal, parfaites pour tajine, rôti ou grillades. Découpées du jour.",
    price: 8.5, promo: null, cat: "poulet",
    img: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=900&q=80",
    featured: 0, recent: 1 },
  { name: "Épaule d'Agneau", slug: "epaule-agneau",
    desc: "Épaule d'agneau désossée, marinée aux herbes orientales. Idéale pour un plat festif.",
    price: 24.9, promo: 21.9, cat: "agneau",
    img: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=900&q=80",
    featured: 1, recent: 0 },
  { name: "Côtelettes d'Agneau", slug: "cotelettes-agneau",
    desc: "Côtelettes d'agneau tendres et savoureuses. Cuisson rapide au grill ou à la poêle.",
    price: 29.9, promo: null, cat: "agneau",
    img: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=900&q=80",
    featured: 0, recent: 1 },
  { name: "Brochettes Mixtes", slug: "brochettes-mixtes",
    desc: "Brochettes marinées bœuf et agneau, avec oignons et poivrons. Prêtes à griller.",
    price: 15.9, promo: 13.5, cat: "brochettes",
    img: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=900&q=80",
    featured: 1, recent: 1 },
  { name: "Brochettes de Poulet", slug: "brochettes-poulet",
    desc: "Brochettes de poulet marinées au citron et épices orientales. Moelleuses et parfumées.",
    price: 12.9, promo: null, cat: "brochettes",
    img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=900&q=80",
    featured: 0, recent: 1 },
  { name: "Merguez Artisanales", slug: "merguez-artisanales",
    desc: "Merguez artisanales préparées par notre boucher. Épices orientales, goût authentique.",
    price: 13.9, promo: 11.5, cat: "merguez",
    img: "https://images.unsplash.com/photo-1606851094291-6efae152bb87?w=900&q=80",
    featured: 1, recent: 0 },
  { name: "Merguez Doux x8", slug: "merguez-doux",
    desc: "Merguez douces, idéales pour toute la famille. Sachet de 8 pièces, sous vide.",
    price: 11.9, promo: null, cat: "merguez",
    img: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=900&q=80",
    featured: 0, recent: 1 },
  { name: "Pack Barbecue Royal", slug: "pack-bbq-royal",
    desc: "Pack complet : 2 entrecôtes, 4 brochettes, 6 merguez, 4 côtelettes d'agneau. Le best-of.",
    price: 79.9, promo: 64.9, cat: "barbecue",
    img: "https://images.unsplash.com/photo-1558030006-450675393462?w=900&q=80",
    featured: 1, recent: 1 },
  { name: "Pack Barbecue Famille", slug: "pack-bbq-famille",
    desc: "Le pack idéal pour un repas convivial : brochettes, poulet, merguez, agneau.",
    price: 49.9, promo: 42.9, cat: "barbecue",
    img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=900&q=80",
    featured: 1, recent: 0 },
];

const getCatId = db.prepare("SELECT id FROM categories WHERE slug = ?");
const prodStmt = db.prepare(
  `INSERT OR IGNORE INTO products
   (name, slug, description, price, promo_price, category_id, image, is_featured, is_recent)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
);
for (const p of PRODUCTS) {
  const cat = getCatId.get(p.cat);
  if (!cat) continue;
  prodStmt.run(
    p.name, p.slug, p.desc, p.price, p.promo, cat.id, p.img, p.featured, p.recent
  );
}

const REVIEWS = [
  { author: "Karim B.", rating: 5,
    content: "Une boucherie exceptionnelle ! La viande est toujours fraîche et le service est irréprochable. Je recommande à 100%." },
  { author: "Sarah M.", rating: 5,
    content: "Le meilleur poulet fermier que j'ai goûté. Accueil chaleureux et conseils précieux du boucher." },
  { author: "Mohamed T.", rating: 5,
    content: "Le pack barbecue royal est une tuerie. Tout était parfait pour notre fête en famille." },
  { author: "Lina A.", rating: 5,
    content: "De la qualité halal au top, on retrouve le goût d'antan. Bravo à toute l'équipe !" },
  { author: "Yacine R.", rating: 5,
    content: "Service rapide, conseils avisés et viande de très grande qualité. Le Carrefour d'Orient est devenu ma boucherie de référence." },
];

const hasReviews = db.prepare("SELECT COUNT(*) AS c FROM reviews").get();
if (!hasReviews.c) {
  const r = db.prepare(
    "INSERT INTO reviews (author, rating, content, approved) VALUES (?, ?, ?, 1)"
  );
  for (const x of REVIEWS) r.run(x.author, x.rating, x.content);
}

const SETTINGS = {
  site_title: "Le Carrefour d'Orient",
  site_tagline: "Boucherie Halal Premium",
  site_subtitle: "L'excellence de la viande halal, sélectionnée avec passion et découpée par nos maîtres bouchers.",
  hero_title: "L'excellence halal,\nservie avec passion",
  hero_subtitle: "Découvrez une boucherie d'exception où qualité, fraîcheur et savoir-faire oriental se rencontrent.",
  about_title: "Un savoir-faire transmis depuis des générations",
  about_text: "Au Carrefour d'Orient, nous perpétuons la tradition d'une boucherie halal d'exception. Chaque pièce est soigneusement sélectionnée, maturée et découpée par nos artisans bouchers. Nous travaillons en direct avec des éleveurs locaux pour vous garantir une traçabilité totale et une qualité irréprochable.",
  address: "12 rue des Saveurs, 75011 Paris",
  phone: "01 23 45 67 89",
  email: "contact@carrefour-orient.fr",
  hours_week: "Mardi – Samedi : 8h00 – 20h00",
  hours_sunday: "Dimanche : 9h00 – 14h00",
  hours_monday: "Lundi : Fermé",
  promo_active: "1",
  promo_title: "Promotion de la semaine",
  promo_text: "-15% sur les packs barbecue jusqu'à dimanche",
  footer_tagline: "Boucherie halal premium — qualité, fraîcheur et tradition depuis 1987.",
};

const setStmt = db.prepare(
  "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)"
);
for (const [k, v] of Object.entries(SETTINGS)) setStmt.run(k, v);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@carrefour-orient.fr";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin2026!Secure";
const existingAdmin = db.prepare("SELECT id FROM users WHERE email = ?").get(ADMIN_EMAIL);
if (!existingAdmin) {
  const hash = bcrypt.hashSync(ADMIN_PASSWORD, 10);
  db.prepare("INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, 'admin')")
    .run(ADMIN_EMAIL, hash, "Administrateur");
  console.log(`✓ Admin créé : ${ADMIN_EMAIL}`);
}

console.log("✓ Base de données initialisée avec succès");
console.log(`  - ${CATS.length} catégories`);
console.log(`  - ${PRODUCTS.length} produits`);
console.log(`  - ${REVIEWS.length} avis`);
console.log(`  - ${Object.keys(SETTINGS).length} paramètres`);
db.close();
