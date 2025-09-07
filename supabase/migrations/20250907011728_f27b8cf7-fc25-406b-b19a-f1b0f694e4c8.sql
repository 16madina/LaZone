-- ABSOLUTE FINAL SECURITY FIX - Block all remaining public access

-- 1. Completely block public access to profiles table
DROP POLICY IF EXISTS "No direct public profile access" ON public.profiles;

-- Create policy that completely blocks anonymous access
CREATE POLICY "Block all public access to profiles" 
ON public.profiles 
FOR ALL
USING (auth.uid() IS NOT NULL); -- Only authenticated users can access

-- 2. Ensure subscribers table has proper RLS protection
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies that might be too permissive
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;

-- Create secure policy for subscribers table
CREATE POLICY "Users can only access their own subscription data" 
ON public.subscribers 
FOR ALL
USING (user_id = auth.uid()); -- Users can only see their own subscription

-- Service role still needs full access for payment processing
CREATE POLICY "Service role full access to subscriptions" 
ON public.subscribers 
FOR ALL
USING (current_setting('role') = 'service_role')
WITH CHECK (current_setting('role') = 'service_role');

-- 3. Update all profile-related functions to ensure they don't bypass RLS
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
SECURITY INVOKER -- Changed from DEFINER to INVOKER for better security
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.user_id,
    CASE 
      WHEN p.user_type = 'agence' THEN p.agency_name
      ELSE 'Agent'  -- Don't expose personal first names to public
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