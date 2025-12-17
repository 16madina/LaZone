-- Create table to track banner clicks
CREATE TABLE public.banner_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  banner_id UUID NOT NULL REFERENCES public.ad_banners(id) ON DELETE CASCADE,
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID,
  ip_hash TEXT
);

-- Enable RLS
ALTER TABLE public.banner_clicks ENABLE ROW LEVEL SECURITY;

-- Anyone can insert clicks (for tracking)
CREATE POLICY "Anyone can track banner clicks" 
ON public.banner_clicks 
FOR INSERT 
WITH CHECK (true);

-- Only admins can view click statistics
CREATE POLICY "Admins can view click statistics" 
ON public.banner_clicks 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add click_count column to ad_banners for quick access
ALTER TABLE public.ad_banners ADD COLUMN click_count INTEGER DEFAULT 0;

-- Create function to increment click count
CREATE OR REPLACE FUNCTION public.increment_banner_click()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.ad_banners 
  SET click_count = click_count + 1 
  WHERE id = NEW.banner_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-increment click count
CREATE TRIGGER on_banner_click
AFTER INSERT ON public.banner_clicks
FOR EACH ROW
EXECUTE FUNCTION public.increment_banner_click();