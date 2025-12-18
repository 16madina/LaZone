-- Create table to store user badges
CREATE TABLE public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  badge_level text NOT NULL DEFAULT 'none',
  listings_count integer NOT NULL DEFAULT 0,
  reviews_count integer NOT NULL DEFAULT 0,
  average_rating numeric(2,1) DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Badges are publicly viewable"
ON public.user_badges FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own badge"
ON public.user_badges FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own badge"
ON public.user_badges FOR UPDATE
USING (auth.uid() = user_id);

-- Create function to calculate badge level
CREATE OR REPLACE FUNCTION public.calculate_badge_level(
  p_listings_count integer,
  p_reviews_count integer,
  p_average_rating numeric
)
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Diamond: 20+ listings, 20+ reviews, 4.8+ rating
  IF p_listings_count >= 20 AND p_reviews_count >= 20 AND p_average_rating >= 4.8 THEN
    RETURN 'diamond';
  -- Platinum: 10+ listings, 10+ reviews, 4.5+ rating
  ELSIF p_listings_count >= 10 AND p_reviews_count >= 10 AND p_average_rating >= 4.5 THEN
    RETURN 'platinum';
  -- Gold: 5+ listings, 5+ reviews, 4+ rating
  ELSIF p_listings_count >= 5 AND p_reviews_count >= 5 AND p_average_rating >= 4.0 THEN
    RETURN 'gold';
  -- Silver: 3+ listings, 2+ reviews, 3+ rating
  ELSIF p_listings_count >= 3 AND p_reviews_count >= 2 AND p_average_rating >= 3.0 THEN
    RETURN 'silver';
  -- Bronze: 1+ listings
  ELSIF p_listings_count >= 1 THEN
    RETURN 'bronze';
  ELSE
    RETURN 'none';
  END IF;
END;
$$;

-- Create function to update user badge and send notification if upgraded
CREATE OR REPLACE FUNCTION public.update_user_badge()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_listings_count integer;
  v_reviews_count integer;
  v_average_rating numeric;
  v_new_badge text;
  v_old_badge text;
  supabase_url TEXT := 'https://yzydlthexjbtdmacqzey.supabase.co';
BEGIN
  -- Determine user_id based on which table triggered this
  IF TG_TABLE_NAME = 'properties' THEN
    v_user_id := NEW.user_id;
  ELSIF TG_TABLE_NAME = 'user_reviews' THEN
    v_user_id := NEW.reviewed_user_id;
  END IF;

  -- Get current badge level
  SELECT badge_level INTO v_old_badge
  FROM public.user_badges
  WHERE user_id = v_user_id;

  IF v_old_badge IS NULL THEN
    v_old_badge := 'none';
  END IF;

  -- Count listings
  SELECT COUNT(*) INTO v_listings_count
  FROM public.properties
  WHERE user_id = v_user_id AND is_active = true;

  -- Count reviews and average rating
  SELECT COUNT(*), COALESCE(AVG(rating), 0) INTO v_reviews_count, v_average_rating
  FROM public.user_reviews
  WHERE reviewed_user_id = v_user_id;

  -- Calculate new badge level
  v_new_badge := calculate_badge_level(v_listings_count, v_reviews_count, v_average_rating);

  -- Upsert user badge
  INSERT INTO public.user_badges (user_id, badge_level, listings_count, reviews_count, average_rating, updated_at)
  VALUES (v_user_id, v_new_badge, v_listings_count, v_reviews_count, v_average_rating, now())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    badge_level = v_new_badge,
    listings_count = v_listings_count,
    reviews_count = v_reviews_count,
    average_rating = v_average_rating,
    updated_at = now();

  -- Send push notification if badge upgraded
  IF v_new_badge != v_old_badge AND v_new_badge != 'none' THEN
    PERFORM net.http_post(
      url := supabase_url || '/functions/v1/send-push-notification',
      body := jsonb_build_object(
        'userId', v_user_id::text,
        'title', '🏆 Nouveau badge débloqué !',
        'body', 'Félicitations ! Vous avez obtenu le badge ' || 
          CASE v_new_badge 
            WHEN 'diamond' THEN 'Diamant'
            WHEN 'platinum' THEN 'Platine'
            WHEN 'gold' THEN 'Or'
            WHEN 'silver' THEN 'Argent'
            WHEN 'bronze' THEN 'Bronze'
          END,
        'data', jsonb_build_object(
          'type', 'badge_unlocked',
          'badge', v_new_badge
        )
      ),
      headers := '{"Content-Type": "application/json"}'::jsonb
    );
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to update user badge: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create triggers for automatic badge updates
CREATE TRIGGER update_badge_on_property_insert
  AFTER INSERT ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_badge();

CREATE TRIGGER update_badge_on_property_update
  AFTER UPDATE OF is_active ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_badge();

CREATE TRIGGER update_badge_on_review_insert
  AFTER INSERT ON public.user_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_badge();