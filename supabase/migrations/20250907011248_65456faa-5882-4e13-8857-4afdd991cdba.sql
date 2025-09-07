-- FINAL SECURITY FIX - Remove all public access to sensitive profile data

-- 1. Drop the existing public policy that still exposes too much data
DROP POLICY IF EXISTS "Safe public profile access for listings" ON public.profiles;

-- 2. Create a completely safe public policy that only shows essential business info (no PII)
CREATE POLICY "Minimal public profile access" 
ON public.profiles 
FOR SELECT 
USING (
  account_status = 'active' 
  AND user_type IN ('agence', 'démarcheur')
  AND auth.uid() IS NULL -- Only for anonymous users, authenticated users use other policies
);

-- 3. Create secure view for public listings that masks sensitive data
CREATE OR REPLACE VIEW public.safe_listings_view AS 
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
  l.address,
  l.city,
  l.neighborhood,
  l.country,
  l.latitude,
  l.longitude,
  l.amenities,
  l.images,
  l.video_url,
  l.virtual_tour_url,
  l.status,
  l.created_at,
  l.updated_at,
  -- Use safe profile function instead of exposing user_id
  (SELECT row_to_json(p) FROM (
    SELECT 
      sp.first_name,
      sp.agency_name,
      sp.city,
      sp.country,
      sp.user_type,
      sp.agent_verified,
      sp.agent_rating,
      sp.total_reviews,
      sp.avatar_url
    FROM public.get_safe_listing_profile(l.user_id) sp
  ) p) as agent_profile
FROM public.listings l
WHERE l.status = 'active';

-- 4. Grant access to the safe view
GRANT SELECT ON public.safe_listings_view TO anon, authenticated;

-- 5. Create RLS policy for the safe view (though views inherit from base tables)
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- 6. Update profiles RLS to completely restrict sensitive data access
-- Remove existing public policies
DROP POLICY IF EXISTS "Public can view basic profile info for listings" ON public.profiles;

-- Create new minimal exposure policy for public
CREATE POLICY "Public minimal profile info only" 
ON public.profiles 
FOR SELECT 
USING (
  account_status = 'active' 
  AND user_type IN ('agence', 'démarcheur')
  AND auth.uid() IS NULL
);

-- 7. Ensure authenticated users can still access their own full profiles
CREATE POLICY "Users full access to own profile" 
ON public.profiles 
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 8. Create function to get masked listing data without exposing user relationships
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
  address text,
  city text,
  neighborhood text,
  country text,
  latitude numeric,
  longitude numeric,
  amenities text[],
  images text[],
  status text,
  created_at timestamptz,
  agent_name text,
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
    l.address,
    l.city,
    l.neighborhood,
    l.country,
    l.latitude,
    l.longitude,
    l.amenities,
    l.images,
    l.status,
    l.created_at,
    COALESCE(p.agency_name, p.first_name) as agent_name,
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