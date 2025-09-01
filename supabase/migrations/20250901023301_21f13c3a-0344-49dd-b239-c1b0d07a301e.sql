-- Clean up old duplicate settings with different keys
DELETE FROM public.app_settings 
WHERE setting_key IN (
  'subscription_monthly_price',
  'subscription_per_listing_price', 
  'free_listings_limit_individual',
  'free_listings_limit_canvasser',
  'free_listings_limit_agency'
);