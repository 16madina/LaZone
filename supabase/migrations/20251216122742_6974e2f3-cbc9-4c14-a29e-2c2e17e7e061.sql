-- Update handle_new_user function to include country
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, phone, country)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'country_code'
  );
  RETURN NEW;
END;
$$;