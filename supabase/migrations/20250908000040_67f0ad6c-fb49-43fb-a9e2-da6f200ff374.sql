-- Ajouter la colonne virtual_tour_url manquante à la table listings
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS virtual_tour_url text;