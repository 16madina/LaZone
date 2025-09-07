-- Complete the fix for the get_safe_listing_profile function

-- Make sure the function returns the correct format and has proper permissions
CREATE OR REPLACE FUNCTION public.get_safe_listing_profile(profile_user_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  display_name text,
  city text,
  country text,
  user_type text,
  agent_verified boolean,
  agent_rating numeric,
  total_reviews integer,
  avatar_url text
) 
LANGUAGE sql
SECURITY DEFINER -- Use DEFINER for controlled access to profiles data
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.user_id,
    -- Safe display name without exposing personal contact details
    CASE 
      WHEN p.user_type = 'agence' THEN p.agency_name
      ELSE COALESCE(p.first_name, 'Agent')
    END as display_name,
    p.city,
    p.country,
    p.user_type,
    p.agent_verified,
    p.agent_rating,
    p.total_reviews,
    p.avatar_url
  FROM public.profiles p
  WHERE p.user_id = profile_user_id
    AND p.account_status = 'active'
    AND p.user_type IN ('agence', 'démarcheur');
$$;

-- Ensure proper permissions are granted
GRANT EXECUTE ON FUNCTION public.get_safe_listing_profile TO anon, authenticated;

-- Also fix the app_settings policy issue from earlier
DROP POLICY IF EXISTS "Authenticated users can read app settings" ON public.app_settings;
CREATE POLICY "Users can read public app settings" 
ON public.app_settings 
FOR SELECT 
USING (true);