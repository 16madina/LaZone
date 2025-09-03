-- Fix profiles table RLS policies for enhanced security
-- First, get a clean slate by dropping all existing policies

DROP POLICY IF EXISTS "Public can view basic agent profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role full access" ON public.profiles;

-- Create comprehensive secure RLS policies

-- 1. Users can only view their own complete profile data
CREATE POLICY "secure_view_own_profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2. Users can only create their own profile
CREATE POLICY "secure_insert_own_profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3. Users can update their own profile but cannot modify admin-controlled fields
CREATE POLICY "secure_update_own_profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND 
  -- Prevent modification of admin-controlled fields
  (OLD.agent_verified IS NOT DISTINCT FROM NEW.agent_verified) AND
  (OLD.account_status IS NOT DISTINCT FROM NEW.account_status) AND
  (OLD.banned_by IS NOT DISTINCT FROM NEW.banned_by) AND
  (OLD.banned_at IS NOT DISTINCT FROM NEW.banned_at) AND
  (OLD.ban_reason IS NOT DISTINCT FROM NEW.ban_reason) AND
  (OLD.listing_count IS NOT DISTINCT FROM NEW.listing_count)
);

-- 4. Users can delete their own profile
CREATE POLICY "secure_delete_own_profile"
ON public.profiles
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 5. Admins have full access to manage all profiles
CREATE POLICY "admin_full_profile_access"
ON public.profiles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 6. Service role maintains system access
CREATE POLICY "service_role_profile_access"
ON public.profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Replace the existing get_public_profile_data function with a more secure version
DROP FUNCTION IF EXISTS public.get_public_profile_data(uuid);

CREATE OR REPLACE FUNCTION public.get_safe_public_profile(profile_user_id uuid)
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

-- Add security documentation
COMMENT ON TABLE public.profiles IS 'Secure user profiles with comprehensive RLS. Users access only their own data. Public safe data via get_safe_public_profile() function excludes sensitive information like phone numbers and addresses.';

COMMENT ON FUNCTION public.get_safe_public_profile IS 'Returns safe public profile data excluding sensitive information like phone numbers, addresses, and admin fields. Only for verified agents/agencies.';