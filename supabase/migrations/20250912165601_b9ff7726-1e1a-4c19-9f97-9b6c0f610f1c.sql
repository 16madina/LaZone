-- Create missing profiles for existing users without profiles
INSERT INTO public.profiles (user_id, email, first_name, last_name, user_type, account_status)
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data ->> 'first_name' AS first_name,
  au.raw_user_meta_data ->> 'last_name' AS last_name,
  COALESCE(au.raw_user_meta_data ->> 'user_type', 'particulier') AS user_type,
  'active' AS account_status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE p.user_id IS NULL;

-- Create a trigger to automatically create profiles when listings are created by users without profiles
CREATE OR REPLACE FUNCTION public.ensure_profile_on_listing()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user has a profile, create one if not
  INSERT INTO public.profiles (user_id, email, user_type, account_status)
  SELECT 
    NEW.user_id,
    au.email,
    COALESCE(au.raw_user_meta_data ->> 'user_type', 'particulier'),
    'active'
  FROM auth.users au
  WHERE au.id = NEW.user_id
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on listings table
DROP TRIGGER IF EXISTS ensure_profile_on_listing ON public.listings;
CREATE TRIGGER ensure_profile_on_listing
  BEFORE INSERT ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_profile_on_listing();

-- Improve the existing handle_new_user function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
    responsible_mobile,
    account_status
  )
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'first_name', 
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.email,
    NEW.phone,
    NEW.raw_user_meta_data ->> 'country',
    NEW.raw_user_meta_data ->> 'city',
    NEW.raw_user_meta_data ->> 'neighborhood',
    COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'particulier'),
    COALESCE((NEW.raw_user_meta_data ->> 'is_canvasser')::boolean, false),
    NEW.raw_user_meta_data ->> 'agency_name',
    NEW.raw_user_meta_data ->> 'responsible_first_name',
    NEW.raw_user_meta_data ->> 'responsible_last_name',
    NEW.raw_user_meta_data ->> 'agency_phone',
    NEW.raw_user_meta_data ->> 'responsible_mobile',
    'active'
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create admin function to check for profile inconsistencies
CREATE OR REPLACE FUNCTION public.check_profile_inconsistencies()
RETURNS TABLE(user_id uuid, email text, has_profile boolean, has_listings boolean) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.email,
    (p.user_id IS NOT NULL) AS has_profile,
    (l.user_id IS NOT NULL) AS has_listings
  FROM auth.users au
  LEFT JOIN public.profiles p ON au.id = p.user_id
  LEFT JOIN public.listings l ON au.id = l.user_id
  WHERE p.user_id IS NULL OR l.user_id IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;