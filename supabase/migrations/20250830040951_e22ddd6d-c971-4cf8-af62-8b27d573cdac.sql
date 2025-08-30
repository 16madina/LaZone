-- Ajouter les colonnes pour vidéo et vue 360° dans la table listings
ALTER TABLE listings 
ADD COLUMN video_url text,
ADD COLUMN virtual_tour_url text;