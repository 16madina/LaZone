-- Fix search_path security issue for handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    user_type,
    first_name,
    last_name,
    agency_name,
    responsible_first_name,
    responsible_last_name,
    country,
    city,
    neighborhood,
    phone,
    agency_phone,
    responsible_mobile
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'user_type', 'particulier'),
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.raw_user_meta_data ->> 'agency_name',
    new.raw_user_meta_data ->> 'responsible_first_name',
    new.raw_user_meta_data ->> 'responsible_last_name',
    new.raw_user_meta_data ->> 'country',
    new.raw_user_meta_data ->> 'city',
    new.raw_user_meta_data ->> 'neighborhood',
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'agency_phone',
    new.raw_user_meta_data ->> 'responsible_mobile'
  );
  RETURN new;
END;
$$;