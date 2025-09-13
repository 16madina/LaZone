-- Create sponsored_listings table
CREATE TABLE public.sponsored_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL,
  user_id UUID NOT NULL,
  sponsored_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sponsored_until TIMESTAMP WITH TIME ZONE NOT NULL,
  amount_paid NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'XOF',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  boost_level INTEGER NOT NULL DEFAULT 1 CHECK (boost_level IN (1, 2, 3)),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sponsored_listings ENABLE ROW LEVEL SECURITY;

-- Create policies for sponsored_listings
CREATE POLICY "Users can view sponsored listings for active listings" 
ON public.sponsored_listings 
FOR SELECT 
USING (
  status = 'active' 
  AND sponsored_until > now()
  AND EXISTS (
    SELECT 1 FROM public.listings 
    WHERE listings.id = sponsored_listings.listing_id 
    AND listings.status = 'active'
  )
);

CREATE POLICY "Users can create sponsored listings for their own listings" 
ON public.sponsored_listings 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.listings 
    WHERE listings.id = sponsored_listings.listing_id 
    AND listings.user_id = auth.uid()
    AND listings.status = 'active'
  )
);

CREATE POLICY "Users can update their own sponsored listings" 
ON public.sponsored_listings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own sponsored listings" 
ON public.sponsored_listings 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_sponsored_listings_updated_at
BEFORE UPDATE ON public.sponsored_listings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to check if listing is currently sponsored
CREATE OR REPLACE FUNCTION public.is_listing_sponsored(listing_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.sponsored_listings
    WHERE listing_id = listing_uuid
      AND status = 'active'
      AND sponsored_until > now()
  );
END;
$$ LANGUAGE plpgsql STABLE;