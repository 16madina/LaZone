-- FINAL SECURITY FIX - Use CASCADE to handle dependencies

-- 1. Drop view that depends on the function
DROP VIEW IF EXISTS public.safe_listings_view CASCADE;

-- 2. Drop and recreate functions with cascade
DROP FUNCTION IF EXISTS public.get_safe_listing_profile(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_public_listings(integer, integer) CASCADE;

-- 3. Create secure function for safe profile data (no contact info)
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
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.user_id,
    -- Safe display name without exposing personal contact details
    CASE 
      WHEN p.user_type = 'agence' THEN p.agency_name
      ELSE COALESCE(p.first_name, 'Agent')
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

-- 4. Create secure function for public listings (no exact addresses or contact info)
CREATE OR REPLACE FUNCTION public.get_public_listings(
  limit_count integer DEFAULT 20,
  offset_count integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  title text,
  description text,
  price numeric,
  currency text,
  purpose text,
  property_type text,
  bedrooms integer,
  bathrooms integer,
  area numeric,
  city text,
  neighborhood text,
  country text,
  amenities text[],
  images text[],
  status text,
  created_at timestamptz,
  agent_display_name text,
  agent_type text,
  agent_verified boolean,
  agent_rating numeric,
  agent_avatar text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    l.id,
    l.title,
    l.description,
    l.price,
    l.currency,
    l.purpose,
    l.property_type,
    l.bedrooms,
    l.bathrooms,
    l.area,
    l.city,
    l.neighborhood,
    l.country,
    l.amenities,
    l.images,
    l.status,
    l.created_at,
    CASE 
      WHEN p.user_type = 'agence' THEN p.agency_name
      ELSE COALESCE(p.first_name, 'Agent')
    END as agent_display_name,
    p.user_type as agent_type,
    p.agent_verified,
    p.agent_rating,
    p.avatar_url as agent_avatar
  FROM public.listings l
  LEFT JOIN public.profiles p ON l.user_id = p.user_id
  WHERE l.status = 'active'
    AND p.account_status = 'active'
    AND p.user_type IN ('agence', 'démarcheur')
  ORDER BY l.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
$$;

-- 5. Recreate the safe view without exact addresses for public access
CREATE VIEW public.safe_listings_view AS 
SELECT 
  l.id,
  l.title,
  l.description,
  l.price,
  l.currency,
  l.purpose,
  l.property_type,
  l.bedrooms,
  l.bathrooms,
  l.area,
  l.land_area,
  -- Only general location, no exact address/coordinates for security
  l.city,
  l.neighborhood,
  l.country,
  NULL::numeric as latitude,
  NULL::numeric as longitude,
  l.amenities,
  l.images,
  l.video_url,
  l.virtual_tour_url,
  l.status,
  l.created_at,
  l.updated_at
FROM public.listings l
WHERE l.status = 'active';

-- 6. Grant permissions
GRANT EXECUTE ON FUNCTION public.get_public_listings TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_safe_listing_profile TO anon, authenticated;
GRANT SELECT ON public.safe_listings_view TO anon, authenticated;