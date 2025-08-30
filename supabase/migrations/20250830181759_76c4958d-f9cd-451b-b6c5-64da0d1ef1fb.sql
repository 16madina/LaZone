-- Modifier la fonction can_create_listing pour permettre aux admins de créer des annonces illimitées
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
  -- Vérifier si l'utilisateur est administrateur
  SELECT public.has_role(user_id_param, 'admin'::app_role) INTO is_admin;
  
  -- Si l'utilisateur est admin, toujours autoriser
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
$function$