-- Fix profiles table RLS policies for better security (corrected)

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

-- 3. Users can only update their own profile (basic fields only)
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

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

-- Create trigger to prevent unauthorized modification of admin fields
CREATE OR REPLACE FUNCTION public.protect_admin_profile_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow admins and service role to modify these sensitive fields
  IF NOT (public.has_role(auth.uid(), 'admin'::app_role) OR current_setting('role') = 'service_role') THEN
    -- Preserve admin-controlled values
    NEW.agent_verified := OLD.agent_verified;
    NEW.account_status := OLD.account_status;
    NEW.banned_by := OLD.banned_by;
    NEW.banned_at := OLD.banned_at;
    NEW.ban_reason := OLD.ban_reason;
    NEW.listing_count := OLD.listing_count;
    NEW.agent_rating := OLD.agent_rating;
    NEW.total_reviews := OLD.total_reviews;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Apply trigger to protect admin fields
DROP TRIGGER IF EXISTS protect_admin_fields ON public.profiles;
CREATE TRIGGER protect_admin_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_admin_profile_fields();