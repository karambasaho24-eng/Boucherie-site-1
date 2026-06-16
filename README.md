# Le Carrefour d'Orient — Boucherie Halal Premium

Site web premium pour une boucherie halal moderne, construit avec **Next.js 14**, **Tailwind CSS**, **SQLite** (via `better-sqlite3`) et un système d'authentification admin sécurisé (JWT + bcrypt).

## ✨ Fonctionnalités

### Partie client
- Page d'accueil premium avec hero, catégories, produits vedettes, promotions, nouveautés, témoignages, horaires, contact
- Page « Nos viandes » avec filtres par catégorie, recherche, tri (populaire, récent, prix)
- Page produit détaillée avec quantité, ajout au panier
- Panier persistant (localStorage) avec tiroir latéral
- Tunnel de commande
- Pages À propos, Contact
- Responsive mobile parfait
- Animations au scroll (IntersectionObserver)
- Design premium (noir / blanc / vert foncé / doré)

### Espace admin (sécurisé)
- Connexion JWT + cookies httpOnly
- Dashboard avec statistiques (nb produits, commandes, CA, top viandes)
- Gestion CRUD des viandes (ajout, modification, suppression, photos, prix, promos, stock, vedettes)
- Gestion des commandes (changer le statut)
- Personnalisation des textes du site sans toucher au code (titre, sous-titres, hero, à propos, horaires, bandeau promo, footer…)

## 🚀 Démarrage

```bash
# 1) Installer les dépendances
npm install

# 2) Lancer en dev (la base SQLite et le compte admin sont créés automatiquement au premier accès)
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) pour le site et [http://localhost:3000/admin](http://localhost:3000/admin) pour l'espace admin.

**Identifiants admin par défaut** :
- Email : `admin@carrefour-orient.fr`
- Mot de passe : `Admin2026!Secure`

Modifiez-les dans `.env.local` (variables `ADMIN_EMAIL` et `ADMIN_PASSWORD`) avant de mettre en production.

## 🏗️ Architecture

```
src/
├─ app/                    # Routes Next.js (App Router)
│  ├─ api/                 # API REST (auth, produits, commandes, settings)
│  ├─ admin/(panel)/       # Espace admin protégé
│  ├─ viandes/             # Catalogue client
│  ├─ commande/            # Tunnel de commande
│  └─ ...
├─ components/
│  ├─ cart/                # Panier (drawer)
│  ├─ layout/              # Navbar, Footer, PromoBar
│  ├─ product/             # ProductCard, AddToCart, Browser
│  ├─ providers/           # Context React
│  └─ ui/                  # Reveal, Stars
├─ lib/
│  ├─ auth.ts              # JWT + bcrypt
│  ├─ bootstrap.ts         # Seed initial + admin
│  ├─ data.ts              # DAL (Data Access Layer)
│  ├─ db.ts                # Connexion SQLite
│  ├─ seed.ts              # Données de seed
│  ├─ types.ts
│  └─ utils.ts
├─ store/                  # Stores client (cart)
└─ data/                   # SQLite (généré au runtime)
```

## 🛡️ Sécurité

- Authentification par **JWT** signé (`jsonwebtoken`) stocké dans un cookie **httpOnly**, `sameSite=lax`, `secure` en production
- Mots de passe hashés avec **bcrypt**
- Toutes les routes admin (`/api/admin/*` et `/admin/(panel)/*`) vérifient la session côté serveur
- Le total d'une commande est **recalculé côté serveur** (jamais pris du client)
- Validation des longueurs et des types sur toutes les entrées
- Cookies SameSite, helpers `cookies()` Next.js (App Router server components)

## 🎨 Stack

- **Next.js 14** (App Router, RSC, Server Actions, route handlers)
- **Tailwind CSS 3** (palette custom : ink / gold / emerald)
- **TypeScript**
- **SQLite** via `better-sqlite3` (zéro config, fichier local)
- **lucide-react** pour les icônes
- Polices **Inter** + **Playfair Display** (Google Fonts via `next/font`)
- Store client minimaliste (sans dépendance externe)

## 📦 Build de production

```bash
npm run build
npm start
```

## 🔧 Variables d'environnement

Voir `.env.example` :
- `JWT_SECRET` : clé secrète JWT (32+ caractères en prod)
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` : identifiants admin (auto-créés au démarrage)

## 📝 Notes

- Les images de démonstration pointent vers Unsplash (autorisé via `next.config.js`).
- Le seed initial crée 12 produits répartis sur 6 catégories, 5 avis, et tous les paramètres éditables.
- Le composant `Reveal` gère les animations au scroll via `IntersectionObserver` (zéro JS lourd).
- Le panier est persisté en `localStorage` via un store `useSyncExternalStore` minimal.
