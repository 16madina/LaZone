-- Fix the problematic RLS policy that causes infinite recursion
-- First, drop the problematic policy
DROP POLICY IF EXISTS "Profiles are only viewable by verified agents for contact purpo" ON public.profiles;

-- Create a security definer function to check if user is verified agent
CREATE OR REPLACE FUNCTION public.is_verified_agent(user_id_param uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(agent_verified, false)
  FROM public.profiles
  WHERE user_id = user_id_param;
$$;

-- Create a new, non-recursive policy for verified agents to view other profiles
CREATE POLICY "Verified agents can view other agent profiles"
ON public.profiles
FOR SELECT
USING (
  (auth.uid() <> user_id) 
  AND public.is_verified_agent(auth.uid()) 
  AND (user_type = ANY (ARRAY['agence'::text, 'démarcheur'::text]))
);

-- Ensure users can always view their own profile (this should already exist but let's make sure)
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);