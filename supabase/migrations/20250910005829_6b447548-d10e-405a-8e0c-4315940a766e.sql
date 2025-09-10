-- Corriger les profils sans email en leur attribuant un email temporaire
UPDATE public.profiles 
SET email = CONCAT('user_', SUBSTRING(user_id::text, 1, 8), '@lazone.app')
WHERE email IS NULL;