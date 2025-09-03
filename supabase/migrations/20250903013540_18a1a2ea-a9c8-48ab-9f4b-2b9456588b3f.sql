-- Fix profiles table RLS policies for enhanced security
-- Drop all existing policies to start clean

DROP POLICY IF EXISTS "Public can view basic agent profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;

-- Create new secure RLS policies

-- 1. Users can only view their own complete profile
CREATE POLICY "secure_own_profile_select"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2. Users can only create their own profile
CREATE POLICY "secure_own_profile_insert"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3. Users can update their own profile (restricted admin fields will be handled by application logic)
CREATE POLICY "secure_own_profile_update"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Users can delete their own profile
CREATE POLICY "secure_own_profile_delete"
ON public.profiles
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 5. Admins have full access to all profiles
CREATE POLICY "admin_all_profiles_access"
ON public.profiles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 6. Service role maintains system access
CREATE POLICY "service_role_all_access"
ON public.profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Replace the existing public profile function with a secure version
DROP FUNCTION IF EXISTS public.get_public_profile_data(uuid);

-- Create a secure function for public profile data that excludes sensitive information
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

-- Update table comment for security documentation
COMMENT ON TABLE public.profiles IS 'Secure user profiles with comprehensive RLS. Users can only access their own complete data. Public safe data available via get_safe_public_profile() function which excludes sensitive information like phone numbers, addresses, and administrative fields.';