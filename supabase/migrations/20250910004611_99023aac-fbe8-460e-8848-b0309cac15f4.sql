-- Corriger les comptes existants sans email
UPDATE auth.users 
SET email = CONCAT('user_', SUBSTRING(id::text, 1, 8), '@temp.lazone.app'),
    email_confirmed_at = now()
WHERE email IS NULL AND id IN (
  SELECT user_id FROM public.profiles WHERE email IS NULL
);

-- Mettre à jour la table profiles avec les emails générés
UPDATE public.profiles 
SET email = auth_users.email
FROM auth.users 
WHERE profiles.user_id = auth_users.id 
AND profiles.email IS NULL;