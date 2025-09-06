-- Nettoyer les annonces avec placeholders pour la production
-- Option 1: Supprimer les annonces avec placeholders seulement
DELETE FROM listings 
WHERE status = 'active' 
  AND images = ARRAY['/placeholder.svg']
  AND user_id = 'f6873620-3d3e-4636-b74d-531721463a03';

-- Option 2: Mettre à jour avec des images de démonstration appropriées
UPDATE listings 
SET images = CASE 
  WHEN property_type = 'apartment' THEN ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=500&fit=crop&crop=center']
  WHEN property_type = 'house' THEN ARRAY['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=500&fit=crop&crop=center']
  WHEN property_type = 'land' THEN ARRAY['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=500&fit=crop&crop=center']
  WHEN property_type = 'commercial' THEN ARRAY['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=500&fit=crop&crop=center']
  ELSE ARRAY['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=500&fit=crop&crop=center']
END
WHERE images = ARRAY['/placeholder.svg'] 
  AND status = 'active';