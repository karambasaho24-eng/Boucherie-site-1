-- ============================================================
-- MIGRATION v4 — Délai de retrait + statut expired + RLS anti-suppression
-- À exécuter dans Supabase SQL Editor
-- ============================================================

-- 1. Ajouter le délai de retrait par défaut dans site_config (texte libre)
alter table public.site_config
  add column if not exists pickup_delay text default '';

-- 2. Ajouter le délai de modification client (en minutes, entier)
alter table public.site_config
  add column if not exists edit_deadline_minutes integer default 60;

-- 3. Ajouter pickup_deadline sur chaque commande (texte libre, ex: "avant 19h", "2h")
alter table public.orders
  add column if not exists pickup_deadline text default '';

-- 4. Le statut "expired" est géré côté client/admin sans contrainte SQL,
--    car la colonne status est en text libre (pas d'enum). On documente les valeurs :
--    pending | confirmed | preparing | ready | completed | cancelled | expired

-- 5. Politique RLS — interdire tout DELETE sur la table orders
--    (garantie robuste indépendante de l'interface)

-- Activer RLS si ce n'est pas déjà fait
alter table public.orders enable row level security;

-- Supprimer une éventuelle policy delete existante avant de recréer
drop policy if exists "orders_no_delete" on public.orders;

-- Policy bloquant le DELETE pour tout le monde (y compris authenticated)
create policy "orders_no_delete"
  on public.orders
  for delete
  using (false);

-- Note : pour supprimer une commande malgré tout (cas exceptionnel),
-- il faudra passer par le service_role key directement dans le SQL Editor.

-- 6. S'assurer que insert et select restent ouverts (policy migration_v3 déjà en place)
-- La policy "orders_insert_select_own" créée en v3 couvre déjà le SELECT.
-- Ajout explicit d'une policy INSERT si absente :
drop policy if exists "orders_insert_public" on public.orders;
create policy "orders_insert_public"
  on public.orders for insert
  with check (true);
