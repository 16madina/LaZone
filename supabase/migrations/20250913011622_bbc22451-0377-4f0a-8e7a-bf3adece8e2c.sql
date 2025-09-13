-- Mise à jour des annonces d'Abengourou pour ajouter le pays Côte d'Ivoire
UPDATE listings 
SET country = 'Côte d''Ivoire' 
WHERE city = 'Abengourou' AND country IS NULL;