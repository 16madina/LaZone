-- Insert default app settings with proper JSONB casting
INSERT INTO app_settings (setting_key, setting_value, description) VALUES
('monthly_price', '20000'::jsonb, 'Prix de l''abonnement mensuel en CFA'),
('per_listing_price', '1000'::jsonb, 'Prix par annonce en CFA'),
('free_listings_individual', '3'::jsonb, 'Nombre d''annonces gratuites pour les particuliers'),
('free_listings_canvasser', '3'::jsonb, 'Nombre d''annonces gratuites pour les démarcheurs'),
('free_listings_agency', '0'::jsonb, 'Nombre d''annonces gratuites pour les agences')
ON CONFLICT (setting_key) DO NOTHING;