-- Clean up remaining profile security issues

-- Remove the old duplicate policy that's still there
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Update the agent-utils to use the new secure function
-- (This ensures existing code uses the secure public access function)
CREATE OR REPLACE FUNCTION public.get_public_profile_data(profile_user_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  first_name text,
  last_name text,
  agency_name text,
  country text,
  city text,
  user_type text,
  agent_verified boolean,
  agent_rating numeric,
  total_reviews integer,
  years_experience integer,
  specializations text[],
  languages_spoken text[],
  avatar_url text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.first_name,
    p.last_name,
    p.agency_name,
    p.country,
    p.city,
    p.user_type,
    p.agent_verified,
    p.agent_rating,
    p.total_reviews,
    p.years_experience,
    p.specializations,
    p.languages_spoken,
    p.avatar_url
  FROM public.profiles p
  WHERE p.user_id = profile_user_id
    AND p.user_type IN ('agence', 'démarcheur')
    AND p.account_status = 'active';
$$;