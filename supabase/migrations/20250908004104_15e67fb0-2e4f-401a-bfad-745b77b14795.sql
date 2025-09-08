-- Créer un profil par défaut pour l'utilisateur actuel
INSERT INTO public.profiles (user_id, display_name, first_name, last_name, user_type)
VALUES (
  'f69583af-5b8a-4266-972c-4910f5761956',
  'Yves Ahipo',
  'Yves', 
  'Ahipo',
  'individual'
) ON CONFLICT (user_id) DO NOTHING;