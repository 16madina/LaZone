-- Ajouter les nouveaux champs pour les terrains dans la table listings
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS land_documents text[],
ADD COLUMN IF NOT EXISTS additional_info text;