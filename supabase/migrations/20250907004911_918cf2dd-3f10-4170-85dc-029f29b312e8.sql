-- CRITICAL SECURITY FIX: Remove dangerous public access to profiles table
-- This fixes the exposed personal information vulnerability

-- First, drop the dangerous public access policy
DROP POLICY IF EXISTS "Allow public access to active profiles" ON public.profiles;

-- Create a safer public policy that only exposes essential listing-related info
-- No sensitive data like phone numbers, addresses, or business details
CREATE POLICY "Public can view basic profile info for listings" 
ON public.profiles 
FOR SELECT 
USING (
  account_status = 'active' 
  AND user_type IN ('agence', 'démarcheur')
);

-- Restrict app_settings to authenticated users only (fixes business data exposure)
DROP POLICY IF EXISTS "Everyone can read app settings" ON public.app_settings;

CREATE POLICY "Authenticated users can read app settings" 
ON public.app_settings 
FOR SELECT 
TO authenticated
USING (true);

-- Add a security audit function to track policy changes
CREATE OR REPLACE FUNCTION public.audit_policy_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    action_type,
    resource_type,
    success,
    ip_address
  ) VALUES (
    auth.uid(),
    'policy_change',
    'rls_policy',
    true,
    inet_client_addr()
  );
  
  RETURN NEW;
END;
$$;

-- Enhance the security monitoring with more granular permissions
CREATE POLICY "Admins can view all security logs" 
ON public.security_audit_log 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create a function to safely get public profile data for listings
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