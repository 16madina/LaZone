-- Insert default app settings
INSERT INTO app_settings (setting_key, setting_value, description) VALUES
('monthly_price', 20000, 'Prix de l''abonnement mensuel en CFA'),
('per_listing_price', 1000, 'Prix par annonce en CFA'),
('free_listings_individual', 3, 'Nombre d''annonces gratuites pour les particuliers'),
('free_listings_canvasser', 3, 'Nombre d''annonces gratuites pour les démarcheurs'),
('free_listings_agency', 0, 'Nombre d''annonces gratuites pour les agences')
ON CONFLICT (setting_key) DO NOTHING;