-- 1) Table des villes (normalisée)
create table if not exists cities (
  id uuid primary key default gen_random_uuid(),
  country_code text not null, -- ex: 'CI'
  name text not null,
  slug text unique not null
);
create index if not exists idx_cities_country on cities(country_code);

-- 2) Ajouter les nouvelles colonnes à la table listings existante
alter table listings 
add column if not exists country_code text,
add column if not exists city_id uuid references cities(id),
add column if not exists owner_id uuid;

-- Migrer les données existantes
update listings set 
  country_code = case 
    when country = 'Côte d''Ivoire' then 'CI'
    when country = 'Sénégal' then 'SN'
    when country = 'Cameroun' then 'CM'
    when country = 'Mali' then 'ML'
    when country = 'Burkina Faso' then 'BF'
    else 'CI' -- défaut
  end,
  owner_id = user_id
where country_code is null or owner_id is null;

-- Mettre à jour les RLS existantes pour utiliser owner_id
drop policy if exists "Users can view their own listings" on listings;
drop policy if exists "Users can create their own listings" on listings;
drop policy if exists "Users can update their own listings" on listings;
drop policy if exists "Users can delete their own listings" on listings;

-- Nouvelles politiques RLS
create policy read_published_listings
on listings for select
to anon, authenticated
using (status = 'active');

create policy insert_own_listing
on listings for insert
to authenticated
with check (auth.uid() = coalesce(owner_id, user_id));

create policy update_own_listing
on listings for update
to authenticated
using (auth.uid() = coalesce(owner_id, user_id));

create policy delete_own_listing
on listings for delete
to authenticated
using (auth.uid() = coalesce(owner_id, user_id));

-- Index utiles
create index if not exists idx_listings_country_status_created
  on listings(country_code, status, created_at desc);
create index if not exists idx_listings_city on listings(city_id);

-- Villes: RLS
alter table cities enable row level security;
create policy read_cities on cities for select to anon, authenticated using (true);