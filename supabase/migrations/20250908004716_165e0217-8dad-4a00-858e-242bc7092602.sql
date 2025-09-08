-- Corriger les données des annonces pour qu'elles s'affichent correctement
UPDATE public.listings 
SET area = 85 
WHERE title = 'Maison test' AND user_id = 'f69583af-5b8a-4266-972c-4910f5761956';

UPDATE public.listings 
SET area = 120 
WHERE title = '3 pieces' AND user_id = 'f69583af-5b8a-4266-972c-4910f5761956';