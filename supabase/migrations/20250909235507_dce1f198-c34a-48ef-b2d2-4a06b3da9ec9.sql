-- Ajouter les colonnes manquantes à la table profiles pour stocker toutes les informations utilisateur
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS neighborhood text,
ADD COLUMN IF NOT EXISTS is_canvasser boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS responsible_first_name text,
ADD COLUMN IF NOT EXISTS responsible_last_name text,
ADD COLUMN IF NOT EXISTS agency_phone text,
ADD COLUMN IF NOT EXISTS responsible_mobile text;

-- Mettre à jour le trigger pour inclure les nouvelles colonnes lors de la création d'un utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public 
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    first_name, 
    last_name,
    email,
    phone,
    country,
    city,
    neighborhood,
    user_type,
    is_canvasser,
    agency_name,
    responsible_first_name,
    responsible_last_name,
    agency_phone,
    responsible_mobile
  )
  VALUES (
    new.id, 
    new.raw_user_meta_data ->> 'first_name', 
    new.raw_user_meta_data ->> 'last_name',
    new.email,
    new.phone,
    new.raw_user_meta_data ->> 'country',
    new.raw_user_meta_data ->> 'city',
    new.raw_user_meta_data ->> 'neighborhood',
    COALESCE(new.raw_user_meta_data ->> 'user_type', 'individual'),
    COALESCE((new.raw_user_meta_data ->> 'is_canvasser')::boolean, false),
    new.raw_user_meta_data ->> 'agency_name',
    new.raw_user_meta_data ->> 'responsible_first_name',
    new.raw_user_meta_data ->> 'responsible_last_name',
    new.raw_user_meta_data ->> 'agency_phone',
    new.raw_user_meta_data ->> 'responsible_mobile'
  );
  RETURN new;
END;
$$;