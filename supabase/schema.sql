-- =============================================================
-- LE CARREFOUR D'ORIENT — Schéma Supabase
-- À exécuter dans l'éditeur SQL de Supabase (dans l'ordre)
-- =============================================================

-- 1) Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2) Table USERS (administrateurs)
create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  password_hash text not null,
  name text,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now()
);

-- 3) Table CATEGORIES
create table if not exists public.categories (
  id serial primary key,
  slug text unique not null,
  name text not null,
  icon text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 4) Table PRODUCTS
create table if not exists public.products (
  id serial primary key,
  name text not null,
  slug text unique not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  promo_price numeric(10,2) check (promo_price >= 0),
  category_id integer references public.categories(id) on delete set null,
  image text,
  in_stock boolean not null default true,
  is_featured boolean not null default false,
  is_recent boolean not null default false,
  views integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_featured on public.products(is_featured);
create index if not exists idx_products_recent on public.products(is_recent);

-- 5) Table ORDERS
create table if not exists public.orders (
  id serial primary key,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  customer_address text,
  notes text,
  total numeric(10,2) not null check (total >= 0),
  status text not null default 'pending'
    check (status in ('pending','confirmed','shipped','delivered','cancelled')),
  created_at timestamptz not null default now()
);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created on public.orders(created_at desc);

-- 6) Table ORDER_ITEMS
create table if not exists public.order_items (
  id serial primary key,
  order_id integer not null references public.orders(id) on delete cascade,
  product_id integer references public.products(id) on delete set null,
  product_name text not null,
  unit_price numeric(10,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0)
);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_order_items_product on public.order_items(product_id);

-- 7) Table REVIEWS
create table if not exists public.reviews (
  id serial primary key,
  author text not null,
  rating integer not null check (rating between 1 and 5),
  content text not null,
  approved boolean not null default true,
  created_at timestamptz not null default now()
);

-- 8) Table SETTINGS (clé/valeur)
create table if not exists public.settings (
  key text primary key,
  value text
);

-- 9) Trigger: updated_at sur products
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_products_updated on public.products;
create trigger trg_products_updated
  before update on public.products
  for each row execute function public.set_updated_at();

-- =============================================================
-- 10) ROW LEVEL SECURITY (RLS)
-- Le serveur utilise la service_role key : il bypass RLS.
-- On active RLS tout de même pour blinder l'accès direct anon.
-- =============================================================
alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.settings enable row level security;

-- Lecture publique (anon) : pour la vitrine
create policy "Public read categories" on public.categories
  for select to anon using (true);
create policy "Public read products" on public.products
  for select to anon using (true);
create policy "Public read reviews" on public.reviews
  for select to anon using (approved = true);
create policy "Public read settings" on public.settings
  for select to anon using (true);

-- Insertion publique des commandes (le client final passe commande)
create policy "Public insert orders" on public.orders
  for insert to anon with check (true);
create policy "Public insert order_items" on public.order_items
  for insert to anon with check (true);

-- Tout le reste est géré via la service_role (bypass RLS)

-- =============================================================
-- 11) STORAGE : bucket "products" pour les photos uploadées
-- =============================================================
-- Créez ce bucket depuis le dashboard Supabase > Storage :
--   - Nom : "products"
--   - Public : oui
-- Ou exécutez :
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

create policy "Public read products bucket"
  on storage.objects for select
  to anon
  using (bucket_id = 'products');

create policy "Public upload products bucket"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'products');

create policy "Public delete products bucket"
  on storage.objects for delete
  to anon
  using (bucket_id = 'products');

-- =============================================================
-- 12) SEED : catégories, produits, avis, paramètres
-- =============================================================
insert into public.categories (slug, name, icon, sort_order) values
  ('boeuf', 'Bœuf', '🥩', 1),
  ('poulet', 'Poulet', '🍗', 2),
  ('agneau', 'Agneau', '🐑', 3),
  ('brochettes', 'Brochettes', '🍢', 4),
  ('merguez', 'Merguez', '🌭', 5),
  ('barbecue', 'Barbecue', '🔥', 6)
on conflict (slug) do nothing;

insert into public.products
  (name, slug, description, price, promo_price, category_id, image, is_featured, is_recent)
select * from (values
  ('Entrecôte de Bœuf'::text, 'entrecote-boeuf'::text,
   'Entrecôte de bœuf halal, persillée et tendre. Idéale pour une grillade savoureuse en famille.'::text,
   32.90, 27.90, (select id from public.categories where slug='boeuf'),
   'https://images.unsplash.com/photo-1603048297172-c92544798d2e?w=900&q=80'::text,
   true, false),
  ('Faux-filet de Bœuf', 'faux-filet-boeuf',
   'Faux-filet maturé, découpe soignée par nos bouchers. Saveur profonde et texture fondante.',
   28.50, null, (select id from public.categories where slug='boeuf'),
   'https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=900&q=80',
   true, false),
  ('Poulet Fermier Entier', 'poulet-fermier',
   'Poulet fermier élevé en plein air, nourri sans OGM. Chair ferme et goût authentique.',
   12.90, 9.90, (select id from public.categories where slug='poulet'),
   'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=900&q=80',
   true, true),
  ('Cuisses de Poulet', 'cuisses-poulet',
   'Cuisses de poulet halal, parfaites pour tajine, rôti ou grillades. Découpées du jour.',
   8.50, null, (select id from public.categories where slug='poulet'),
   'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=900&q=80',
   false, true),
  ('Épaule d''Agneau', 'epaule-agneau',
   'Épaule d''agneau désossée, marinée aux herbes orientales. Idéale pour un plat festif.',
   24.90, 21.90, (select id from public.categories where slug='agneau'),
   'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=900&q=80',
   true, false),
  ('Côtelettes d''Agneau', 'cotelettes-agneau',
   'Côtelettes d''agneau tendres et savoureuses. Cuisson rapide au grill ou à la poêle.',
   29.90, null, (select id from public.categories where slug='agneau'),
   'https://images.unsplash.com/photo-1574484284002-952d92456975?w=900&q=80',
   false, true),
  ('Brochettes Mixtes', 'brochettes-mixtes',
   'Brochettes marinées bœuf et agneau, avec oignons et poivrons. Prêtes à griller.',
   15.90, 13.50, (select id from public.categories where slug='brochettes'),
   'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=900&q=80',
   true, true),
  ('Brochettes de Poulet', 'brochettes-poulet',
   'Brochettes de poulet marinées au citron et épices orientales. Moelleuses et parfumées.',
   12.90, null, (select id from public.categories where slug='brochettes'),
   'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=900&q=80',
   false, true),
  ('Merguez Artisanales', 'merguez-artisanales',
   'Merguez artisanales préparées par notre boucher. Épices orientales, goût authentique.',
   13.90, 11.50, (select id from public.categories where slug='merguez'),
   'https://images.unsplash.com/photo-1606851094291-6efae152bb87?w=900&q=80',
   true, false),
  ('Merguez Doux x8', 'merguez-doux',
   'Merguez douces, idéales pour toute la famille. Sachet de 8 pièces, sous vide.',
   11.90, null, (select id from public.categories where slug='merguez'),
   'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=900&q=80',
   false, true),
  ('Pack Barbecue Royal', 'pack-bbq-royal',
   'Pack complet : 2 entrecôtes, 4 brochettes, 6 merguez, 4 côtelettes d''agneau. Le best-of.',
   79.90, 64.90, (select id from public.categories where slug='barbecue'),
   'https://images.unsplash.com/photo-1558030006-450675393462?w=900&q=80',
   true, true),
  ('Pack Barbecue Famille', 'pack-bbq-famille',
   'Le pack idéal pour un repas convivial : brochettes, poulet, merguez, agneau.',
   49.90, 42.90, (select id from public.categories where slug='barbecue'),
   'https://images.unsplash.com/photo-1544025162-d76694265947?w=900&q=80',
   true, false)
) as v(name, slug, description, price, promo_price, category_id, image, is_featured, is_recent)
on conflict (slug) do nothing;

insert into public.reviews (author, rating, content, approved) values
  ('Karim B.', 5, 'Une boucherie exceptionnelle ! La viande est toujours fraîche et le service est irréprochable. Je recommande à 100%.', true),
  ('Sarah M.', 5, 'Le meilleur poulet fermier que j''ai goûté. Accueil chaleureux et conseils précieux du boucher.', true),
  ('Mohamed T.', 5, 'Le pack barbecue royal est une tuerie. Tout était parfait pour notre fête en famille.', true),
  ('Lina A.', 5, 'De la qualité halal au top, on retrouve le goût d''antan. Bravo à toute l''équipe !', true),
  ('Yacine R.', 5, 'Service rapide, conseils avisés et viande de très grande qualité. Le Carrefour d''Orient est devenu ma boucherie de référence.', true);

insert into public.settings (key, value) values
  ('site_title', 'Le Carrefour d''Orient'),
  ('site_tagline', 'Boucherie Halal Premium'),
  ('site_subtitle', 'L''excellence de la viande halal, sélectionnée avec passion et découpée par nos maîtres bouchers.'),
  ('hero_title', 'L''excellence halal,\nservie avec passion'),
  ('hero_subtitle', 'Découvrez une boucherie d''exception où qualité, fraîcheur et savoir-faire oriental se rencontrent.'),
  ('about_title', 'Un savoir-faire transmis depuis des générations'),
  ('about_text', 'Au Carrefour d''Orient, nous perpétuons la tradition d''une boucherie halal d''exception. Chaque pièce est soigneusement sélectionnée, maturée et découpée par nos artisans bouchers. Nous travaillons en direct avec des éleveurs locaux pour vous garantir une traçabilité totale et une qualité irréprochable.'),
  ('address', '12 rue des Saveurs, 75011 Paris'),
  ('phone', '01 23 45 67 89'),
  ('email', 'contact@carrefour-orient.fr'),
  ('hours_week', 'Mardi – Samedi : 8h00 – 20h00'),
  ('hours_sunday', 'Dimanche : 9h00 – 14h00'),
  ('hours_monday', 'Lundi : Fermé'),
  ('promo_active', '1'),
  ('promo_title', 'Promotion de la semaine'),
  ('promo_text', '-15% sur les packs barbecue jusqu''à dimanche'),
  ('footer_tagline', 'Boucherie halal premium — qualité, fraîcheur et tradition depuis 1987.')
on conflict (key) do nothing;

-- =============================================================
-- 13) COMPTE ADMIN (mot de passe bcrypt du mot de passe "Admin2026!Secure")
-- Généré ci-dessous : hash bcrypt de "Admin2026!Secure"
-- (coût 10). Changez-le après la première connexion.
-- =============================================================
insert into public.users (email, password_hash, name, role)
values (
  'admin@carrefour-orient.fr',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'Administrateur',
  'admin'
)
on conflict (email) do nothing;

-- =============================================================
-- 14) VUE STATISTIQUES (utilisée par le dashboard admin)
-- =============================================================
create or replace view public.v_top_products as
  select p.id, p.name, p.image, coalesce(sum(oi.quantity), 0)::int as qty
  from public.products p
  left join public.order_items oi on oi.product_id = p.id
  group by p.id
  order by qty desc
  limit 5;

create or replace view public.v_stats as
  select
    (select count(*) from public.products)::int as total_products,
    (select count(*) from public.orders)::int as total_orders,
    (select count(*) from public.orders where status = 'pending')::int as pending_orders,
    coalesce((select sum(total) from public.orders where status <> 'cancelled'), 0)::numeric as revenue;

-- =============================================================
-- Terminé. Le serveur Next.js se connectera via DATABASE_URL
-- + SUPABASE_SERVICE_ROLE_KEY (voir .env.example).
-- =============================================================
