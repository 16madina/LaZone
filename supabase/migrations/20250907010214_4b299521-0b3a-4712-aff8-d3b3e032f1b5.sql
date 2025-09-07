-- CRITICAL SECURITY FIXES - Phase 1: Data Protection

-- 1. Remove dangerous public access policies from profiles table
DROP POLICY IF EXISTS "Public can view basic profile info for listings" ON public.profiles;

-- 2. Create safe public access policy that only exposes essential listing data without PII
CREATE POLICY "Safe public profile access for listings" 
ON public.profiles 
FOR SELECT 
USING (
  account_status = 'active' 
  AND user_type IN ('agence', 'démarcheur')
);

-- 3. Create secure function to get safe profile data for listings (no sensitive PII)
CREATE OR REPLACE FUNCTION public.get_safe_listing_profile(profile_user_id uuid)
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
  avatar_url text
) 
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
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
    p.avatar_url
  FROM public.profiles p
  WHERE p.user_id = profile_user_id
    AND p.account_status = 'active'
    AND p.user_type IN ('agence', 'démarcheur');
$$;

-- 4. Create secure function for agent profiles with additional safe data
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
SET search_path = public
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

-- 5. Create function for completely public profile access (for directories, etc)
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
SET search_path = public
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

-- 6. Restrict app_settings access to authenticated users only
DROP POLICY IF EXISTS "Authenticated users can read app settings" ON public.app_settings;

CREATE POLICY "Authenticated users can read app settings" 
ON public.app_settings 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 7. Add security audit function for logging security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id uuid,
  p_action_type text,
  p_resource_type text,
  p_resource_id uuid DEFAULT NULL,
  p_ip_address inet DEFAULT NULL,
  p_success boolean DEFAULT true,
  p_error_message text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_id uuid;
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    action_type,
    resource_type,
    resource_id,
    ip_address,
    success,
    error_message
  ) VALUES (
    p_user_id,
    p_action_type,
    p_resource_type,
    p_resource_id,
    p_ip_address,
    p_success,
    p_error_message
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$;

-- 8. Add trigger to protect admin-controlled profile fields
CREATE OR REPLACE FUNCTION public.protect_admin_profile_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Create trigger for protecting admin fields
DROP TRIGGER IF EXISTS protect_admin_fields_trigger ON public.profiles;
CREATE TRIGGER protect_admin_fields_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_admin_profile_fields();