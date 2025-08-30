-- Fix search_path security issue for functions
CREATE OR REPLACE FUNCTION public.can_create_listing(user_id_param UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_profile RECORD;
  user_subscription RECORD;
BEGIN
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
$$;

CREATE OR REPLACE FUNCTION public.increment_listing_count()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles 
  SET listing_count = listing_count + 1 
  WHERE user_id = NEW.user_id;
  
  -- Decrement listings_remaining if user has per-listing subscription
  UPDATE public.subscribers 
  SET listings_remaining = GREATEST(0, listings_remaining - 1)
  WHERE user_id = NEW.user_id AND listings_remaining > 0;
  
  RETURN NEW;
END;
$$;