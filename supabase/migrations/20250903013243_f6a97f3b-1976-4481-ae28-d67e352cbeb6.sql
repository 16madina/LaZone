-- Fix profiles table RLS policies for better security

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Public can view basic agent profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;

-- Create secure RLS policies for profiles table

-- 1. Users can only view their own complete profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2. Users can only insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3. Users can only update their own profile (except sensitive admin fields)
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND 
  -- Prevent users from modifying admin-controlled fields
  OLD.agent_verified = NEW.agent_verified AND
  OLD.account_status = NEW.account_status AND
  OLD.banned_by = NEW.banned_by AND
  OLD.banned_at = NEW.banned_at AND
  OLD.ban_reason = NEW.ban_reason AND
  OLD.listing_count = NEW.listing_count
);

-- 4. Users can delete their own profile
CREATE POLICY "Users can delete own profile"
ON public.profiles
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 5. Admins can perform all operations
CREATE POLICY "Admins can manage all profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 6. Service role access for system operations
CREATE POLICY "Service role full access"
ON public.profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create a secure function for public profile viewing that only returns safe data
CREATE OR REPLACE FUNCTION public.get_safe_agent_profile(profile_user_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  first_name text,
  agency_name text,
  city text,
  country text,
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
    p.agency_name,
    p.city,
    p.country,
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
    AND p.account_status = 'active'
    AND p.user_id != COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid);
$$;

-- Add comment explaining the security model
COMMENT ON TABLE public.profiles IS 'User profiles with strict RLS. Users can only access their own data. Public agent data available via get_safe_agent_profile() function.';

-- Log this security improvement
SELECT public.log_security_event(
  auth.uid(),
  'security_enhancement',
  'profiles_table',
  null,
  null,
  true,
  'Updated RLS policies for enhanced profile data protection'
);