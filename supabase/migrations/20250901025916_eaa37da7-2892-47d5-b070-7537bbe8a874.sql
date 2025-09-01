-- Enable real-time replication for app_settings table
ALTER TABLE public.app_settings REPLICA IDENTITY FULL;