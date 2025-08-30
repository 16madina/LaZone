-- Create subscribers table for subscription management
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_type TEXT, -- 'monthly' or 'per_listing'
  subscription_end TIMESTAMPTZ,
  listings_remaining INTEGER DEFAULT 0, -- for per-listing subscriptions
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "select_own_subscription" ON public.subscribers
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "update_own_subscription" ON public.subscribers
FOR UPDATE
USING (true);

CREATE POLICY "insert_subscription" ON public.subscribers
FOR INSERT
WITH CHECK (true);

-- Add listing_count to track free listings used
ALTER TABLE public.profiles 
ADD COLUMN listing_count INTEGER DEFAULT 0;

-- Create function to check listing limits
CREATE OR REPLACE FUNCTION public.can_create_listing(user_id_param UUID)
RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update listing count when listing is created
CREATE OR REPLACE FUNCTION public.increment_listing_count()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_listing_count_trigger
  AFTER INSERT ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_listing_count();