-- Fix remaining security warnings

-- 1. Fix remaining functions without proper search_path (Function Search Path Mutable)
CREATE OR REPLACE FUNCTION public.increment_listing_count()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public'
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

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    user_type,
    first_name,
    last_name,
    agency_name,
    responsible_first_name,
    responsible_last_name,
    country,
    city,
    neighborhood,
    phone,
    agency_phone,
    responsible_mobile
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'user_type', 'particulier'),
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.raw_user_meta_data ->> 'agency_name',
    new.raw_user_meta_data ->> 'responsible_first_name',
    new.raw_user_meta_data ->> 'responsible_last_name',
    new.raw_user_meta_data ->> 'country',
    new.raw_user_meta_data ->> 'city',
    new.raw_user_meta_data ->> 'neighborhood',
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'agency_phone',
    new.raw_user_meta_data ->> 'responsible_mobile'
  );
  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_user_review_stats()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  -- Mettre à jour les stats de l'utilisateur évalué
  UPDATE public.profiles 
  SET 
    agent_rating = (
      SELECT COALESCE(AVG(rating), 0.0)
      FROM public.reviews 
      WHERE reviewed_user_id = COALESCE(NEW.reviewed_user_id, OLD.reviewed_user_id)
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.reviews 
      WHERE reviewed_user_id = COALESCE(NEW.reviewed_user_id, OLD.reviewed_user_id)
    )
  WHERE user_id = COALESCE(NEW.reviewed_user_id, OLD.reviewed_user_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.can_create_listing(user_id_param uuid)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
DECLARE
  user_profile RECORD;
  user_subscription RECORD;
  is_admin BOOLEAN;
BEGIN
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
$$;

CREATE OR REPLACE FUNCTION public.is_verified_agent(user_id_param uuid)
RETURNS BOOLEAN 
LANGUAGE sql 
STABLE 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
  SELECT COALESCE(agent_verified, false)
  FROM public.profiles
  WHERE user_id = user_id_param;
$$;