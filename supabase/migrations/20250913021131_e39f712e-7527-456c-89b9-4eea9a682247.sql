-- Corriger l'annonce "Maison" qui n'a pas de country_code
UPDATE listings 
SET country_code = 'CI' 
WHERE id = 'd5ea74ce-d05f-4bdd-b679-1aa98cd2ef15' AND country_code IS NULL;