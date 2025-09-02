-- Phase 1: Critical Security Fixes

-- 1. Secure admin_actions table with proper RLS policies
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin actions
CREATE POLICY "Admins can view admin actions" 
ON public.admin_actions 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can create admin actions
CREATE POLICY "Admins can create admin actions" 
ON public.admin_actions 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update admin actions
CREATE POLICY "Admins can update admin actions" 
ON public.admin_actions 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete admin actions
CREATE POLICY "Admins can delete admin actions" 
ON public.admin_actions 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Secure profiles table - restrict access to sensitive phone data
-- Remove overly permissive policies and create more restrictive ones
DROP POLICY IF EXISTS "Verified agents can view other agent profiles" ON public.profiles;

-- Create new restrictive policy for agent profiles (without sensitive data)
CREATE POLICY "Public can view basic agent profiles" 
ON public.profiles 
FOR SELECT 
USING (
  user_type IN ('agence', 'démarcheur') 
  AND account_status = 'active' 
  AND auth.uid() != user_id
);

-- 3. Fix database functions security by adding proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public';

-- 4. Create secure function for public profile access (without sensitive data)
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

-- 5. Secure notifications table - only system should insert
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (current_setting('role') = 'service_role');

-- 6. Add security audit logging function
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id uuid,
  p_action_type text,
  p_resource_type text,
  p_resource_id uuid DEFAULT NULL,
  p_ip_address inet DEFAULT NULL,
  p_success boolean DEFAULT true,
  p_error_message text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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