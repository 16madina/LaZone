-- Create app_settings table for dynamic configuration
CREATE TABLE public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage app settings
CREATE POLICY "Admins can manage app settings" 
ON public.app_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.app_settings (setting_key, setting_value, description) VALUES 
('subscription_monthly_price', '{"amount": 5000, "currency": "CFA"}', 'Prix de l''abonnement mensuel en centimes'),
('subscription_per_listing_price', '{"amount": 1000, "currency": "CFA"}', 'Prix par annonce en centimes'),
('free_listings_limit_individual', '{"limit": 3}', 'Nombre d''annonces gratuites pour les particuliers'),
('free_listings_limit_canvasser', '{"limit": 3}', 'Nombre d''annonces gratuites pour les démarcheurs'),
('free_listings_limit_agency', '{"limit": 0}', 'Nombre d''annonces gratuites pour les agences');