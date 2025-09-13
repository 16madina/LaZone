-- 1) Table des villes (normalisée)
create table if not exists cities (
  id uuid primary key default gen_random_uuid(),
  country_code text not null, -- ex: 'CI'
  name text not null,
  slug text unique not null
);
create index if not exists idx_cities_country on cities(country_code);

-- 2) Table des annonces
create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null, -- auth.users.id
  title text not null,
  description text,
  price numeric,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  country_code text not null,          -- 'CI', 'SN', 'CM', ...
  city_id uuid references cities(id),
  neighborhood text,
  -- carte
  lat double precision,                -- requis si on affiche sur carte
  lng double precision,
  address text,
  images jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index utiles
create index if not exists idx_listings_country_status_created
  on listings(country_code, status, created_at desc);
create index if not exists idx_listings_city on listings(city_id);
create index if not exists idx_listings_geo on listings(lat, lng);

-- RLS
alter table listings enable row level security;

-- Voir les annonces publiées (tout le monde)
drop policy if exists read_published_listings on listings;
create policy read_published_listings
on listings for select
to anon, authenticated
using (status = 'published');

-- Créer ses propres annonces (utilisateur connecté)
drop policy if exists insert_own_listing on listings;
create policy insert_own_listing
on listings for insert
to authenticated
with check (auth.uid() = owner_id);

-- Modifier sa propre annonce
drop policy if exists update_own_listing on listings;
create policy update_own_listing
on listings for update
to authenticated
using (auth.uid() = owner_id);

-- Villes: lecture publique
alter table cities enable row level security;
drop policy if exists read_cities on cities;
create policy read_cities on cities for select to anon, authenticated using (true);