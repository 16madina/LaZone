-- COMPREHENSIVE FINAL SECURITY FIX - Address all remaining vulnerabilities

-- 1. COMPLETELY RESTRICT public access to profiles table with sensitive data
DROP POLICY IF EXISTS "Public minimal profile info only" ON public.profiles;
DROP POLICY IF EXISTS "Minimal public profile access" ON public.profiles;

-- No public access to profiles table at all - only through secure functions
CREATE POLICY "No direct public profile access" 
ON public.profiles 
FOR SELECT 
USING (false); -- Block all public access

-- 2. Update the safe listings view to mask exact addresses for unauthenticated users
DROP VIEW IF EXISTS public.safe_listings_view;

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
  -- Mask exact address for public - only show general area
  l.city,
  l.neighborhood,
  l.country,
  -- Remove exact coordinates for public access
  NULL::numeric as latitude,
  NULL::numeric as longitude,
  l.amenities,
  l.images,
  l.video_url,
  l.virtual_tour_url,
  l.status,
  l.created_at,
  l.updated_at,
  -- Use safe profile function that doesn't expose contact info
  (SELECT row_to_json(p) FROM (
    SELECT 
      CASE 
        WHEN sp.user_type = 'agence' THEN sp.agency_name
        ELSE sp.first_name
      END as display_name,
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

-- 3. Update public listings function to not expose sensitive location/contact data
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
      ELSE p.first_name
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

-- 4. Create authenticated function for full listing details (with exact location)
CREATE OR REPLACE FUNCTION public.get_authenticated_listing_details(listing_id uuid)
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
  land_area numeric,
  address text,
  city text,
  neighborhood text,
  country text,
  latitude numeric,
  longitude numeric,
  amenities text[],
  images text[],
  video_url text,
  virtual_tour_url text,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  agent_contact_info jsonb
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
    jsonb_build_object(
      'name', CASE WHEN p.user_type = 'agence' THEN p.agency_name ELSE p.first_name END,
      'type', p.user_type,
      'verified', p.agent_verified,
      'rating', p.agent_rating,
      'avatar', p.avatar_url,
      'city', p.city,
      'country', p.country
    ) as agent_contact_info
  FROM public.listings l
  LEFT JOIN public.profiles p ON l.user_id = p.user_id
  WHERE l.id = listing_id
    AND l.status = 'active'
    AND p.account_status = 'active'
    AND auth.uid() IS NOT NULL; -- Only for authenticated users
$$;

-- 5. Update safe profile functions to never expose contact information
CREATE OR REPLACE FUNCTION public.get_safe_listing_profile(profile_user_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  first_name text,
  agency_name text,
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
    -- Only return first name or agency name, never full contact details
    CASE WHEN p.user_type = 'agence' THEN NULL ELSE p.first_name END as first_name,
    CASE WHEN p.user_type = 'agence' THEN p.agency_name ELSE NULL END as agency_name,
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

-- 6. Grant appropriate permissions
GRANT EXECUTE ON FUNCTION public.get_public_listings TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_authenticated_listing_details TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_safe_listing_profile TO anon, authenticated;