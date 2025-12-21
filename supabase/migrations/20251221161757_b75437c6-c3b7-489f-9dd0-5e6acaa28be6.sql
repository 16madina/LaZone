-- Add listing_type column to properties table for LaZone/LaZone Residence switch
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS listing_type text NOT NULL DEFAULT 'long_term' 
CHECK (listing_type IN ('long_term', 'short_term'));

-- Add price_per_night for short-term rentals
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS price_per_night numeric NULL;

-- Add minimum_stay for short-term rentals (in nights)
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS minimum_stay integer NULL DEFAULT 1;

-- Create index for faster filtering by listing_type
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON public.properties(listing_type);

-- Add comment for documentation
COMMENT ON COLUMN public.properties.listing_type IS 'Type of listing: long_term (LaZone) or short_term (LaZone Residence)';
COMMENT ON COLUMN public.properties.price_per_night IS 'Price per night for short-term rentals (LaZone Residence)';
COMMENT ON COLUMN public.properties.minimum_stay IS 'Minimum number of nights for short-term rentals';