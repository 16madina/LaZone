-- Create table for ad banners
CREATE TABLE public.ad_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text NOT NULL,
  link_url text,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.ad_banners ENABLE ROW LEVEL SECURITY;

-- Everyone can view active banners
CREATE POLICY "Active banners are viewable by everyone"
ON public.ad_banners
FOR SELECT
USING (is_active = true);

-- Admins can view all banners
CREATE POLICY "Admins can view all banners"
ON public.ad_banners
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can manage banners
CREATE POLICY "Admins can insert banners"
ON public.ad_banners
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update banners"
ON public.ad_banners
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete banners"
ON public.ad_banners
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for ad banners
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ad-banners', 'ad-banners', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for ad banners
CREATE POLICY "Ad banner images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'ad-banners');

CREATE POLICY "Admins can upload ad banner images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'ad-banners' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update ad banner images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'ad-banners' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete ad banner images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'ad-banners' AND has_role(auth.uid(), 'admin'::app_role));