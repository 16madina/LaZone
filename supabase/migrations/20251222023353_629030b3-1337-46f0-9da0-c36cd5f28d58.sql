-- Add discount packages columns to properties table for short-term rentals
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS discount_3_nights numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS discount_5_nights numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS discount_7_nights numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS discount_14_nights numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS discount_30_nights numeric DEFAULT NULL;

-- Add comments for clarity
COMMENT ON COLUMN public.properties.discount_3_nights IS 'Percentage discount for 3+ nights stay';
COMMENT ON COLUMN public.properties.discount_5_nights IS 'Percentage discount for 5+ nights stay';
COMMENT ON COLUMN public.properties.discount_7_nights IS 'Percentage discount for 7+ nights stay';
COMMENT ON COLUMN public.properties.discount_14_nights IS 'Percentage discount for 14+ nights stay';
COMMENT ON COLUMN public.properties.discount_30_nights IS 'Percentage discount for 30+ nights stay';