-- Create table for manually blocked dates
CREATE TABLE public.property_blocked_dates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  blocked_date date NOT NULL,
  reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(property_id, blocked_date)
);

-- Enable RLS
ALTER TABLE public.property_blocked_dates ENABLE ROW LEVEL SECURITY;

-- Only property owners can manage blocked dates
CREATE POLICY "Property owners can view blocked dates"
ON public.property_blocked_dates
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.properties 
    WHERE properties.id = property_blocked_dates.property_id 
    AND properties.user_id = auth.uid()
  )
);

CREATE POLICY "Property owners can insert blocked dates"
ON public.property_blocked_dates
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.properties 
    WHERE properties.id = property_blocked_dates.property_id 
    AND properties.user_id = auth.uid()
  )
);

CREATE POLICY "Property owners can delete blocked dates"
ON public.property_blocked_dates
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.properties 
    WHERE properties.id = property_blocked_dates.property_id 
    AND properties.user_id = auth.uid()
  )
);

-- Public can view blocked dates to know unavailability
CREATE POLICY "Anyone can view blocked dates for active properties"
ON public.property_blocked_dates
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.properties 
    WHERE properties.id = property_blocked_dates.property_id 
    AND properties.is_active = true
  )
);