-- Ajouter la colonne country manquante à la table listings
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS country text;