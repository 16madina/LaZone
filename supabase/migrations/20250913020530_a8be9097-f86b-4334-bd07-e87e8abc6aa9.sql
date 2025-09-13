-- Mise à jour de la politique pour permettre la lecture des annonces actives
drop policy if exists read_published_listings on listings;
create policy read_published_listings
on listings for select
to anon, authenticated
using (status = 'active');