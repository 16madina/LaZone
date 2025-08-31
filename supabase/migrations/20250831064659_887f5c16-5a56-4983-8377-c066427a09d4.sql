-- Fix critical security issues

-- 1. Fix subscribers table RLS policies
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;

-- Create proper RLS policies for subscribers table
CREATE POLICY "Service role can insert subscriptions" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (current_setting('role') = 'service_role');

CREATE POLICY "Users can view their own subscription" 
ON public.subscribers 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Service role can update subscriptions" 
ON public.subscribers 
FOR UPDATE 
USING (current_setting('role') = 'service_role');

-- 2. Fix performance_metrics table RLS policies
DROP POLICY IF EXISTS "Users can view aggregated performance data" ON public.performance_metrics;

CREATE POLICY "Users can view their own performance metrics" 
ON public.performance_metrics 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all performance metrics" 
ON public.performance_metrics 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Fix database functions security
CREATE OR REPLACE FUNCTION public.can_create_listing(user_id_param uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_profile RECORD;
  user_subscription RECORD;
  is_admin BOOLEAN;
BEGIN
  -- Set search path for security
  SET search_path = public;
  
  -- Check if user is admin
  SELECT public.has_role(user_id_param, 'admin'::app_role) INTO is_admin;
  
  -- If user is admin, always allow
  IF is_admin = true THEN
    RETURN TRUE;
  END IF;
  
  -- Get user profile
  SELECT * INTO user_profile FROM public.profiles WHERE user_id = user_id_param;
  
  IF user_profile IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Get user subscription
  SELECT * INTO user_subscription FROM public.subscribers WHERE user_id = user_id_param;
  
  -- If user has active monthly subscription, always allow
  IF user_subscription.subscribed = true AND user_subscription.subscription_type = 'monthly' 
     AND user_subscription.subscription_end > now() THEN
    RETURN TRUE;
  END IF;
  
  -- If user has per-listing credits, allow
  IF user_subscription.listings_remaining > 0 THEN
    RETURN TRUE;
  END IF;
  
  -- Check free listing limits
  IF user_profile.user_type = 'agence' THEN
    -- Agencies cannot post free listings
    RETURN FALSE;
  ELSE
    -- Individuals/démarcheurs can post 3 free listings
    RETURN user_profile.listing_count < 3;
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SET search_path = public;
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

CREATE OR REPLACE FUNCTION public.is_verified_agent(user_id_param uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SET search_path = public;
  SELECT COALESCE(agent_verified, false)
  FROM public.profiles
  WHERE user_id = user_id_param;
$function$;