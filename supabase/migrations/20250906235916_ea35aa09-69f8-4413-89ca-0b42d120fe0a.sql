-- Ajouter les coordonnées GPS pour les villes existantes des vraies annonces
-- Coordonnées précises pour les principales villes

-- Abidjan, Côte d'Ivoire (plusieurs quartiers)
UPDATE listings 
SET latitude = 5.3600, longitude = -4.0083 
WHERE city = 'Abidjan' AND latitude IS NULL AND longitude IS NULL;

-- Abengourou, Côte d'Ivoire  
UPDATE listings 
SET latitude = 6.7294, longitude = -3.4968 
WHERE city = 'Abengourou' AND latitude IS NULL AND longitude IS NULL;

-- Bouaké, Côte d'Ivoire
UPDATE listings 
SET latitude = 7.6906, longitude = -5.0300 
WHERE city = 'Bouaké' AND latitude IS NULL AND longitude IS NULL;

-- Daloa, Côte d'Ivoire
UPDATE listings 
SET latitude = 6.8775, longitude = -6.4503 
WHERE city = 'Daloa' AND latitude IS NULL AND longitude IS NULL;

-- Yamoussoukro, Côte d'Ivoire
UPDATE listings 
SET latitude = 6.8276, longitude = -5.2893 
WHERE city = 'Yamoussoukro' AND latitude IS NULL AND longitude IS NULL;

-- San Pedro, Côte d'Ivoire  
UPDATE listings 
SET latitude = 4.7467, longitude = -6.6364 
WHERE city = 'San Pedro' AND latitude IS NULL AND longitude IS NULL;

-- Korhogo, Côte d'Ivoire
UPDATE listings 
SET latitude = 9.4580, longitude = -5.6292 
WHERE city = 'Korhogo' AND latitude IS NULL AND longitude IS NULL;

-- Man, Côte d'Ivoire
UPDATE listings 
SET latitude = 7.4125, longitude = -7.5544 
WHERE city = 'Man' AND latitude IS NULL AND longitude IS NULL;

-- Gagnoa, Côte d'Ivoire
UPDATE listings 
SET latitude = 6.1319, longitude = -5.9506 
WHERE city = 'Gagnoa' AND latitude IS NULL AND longitude IS NULL;