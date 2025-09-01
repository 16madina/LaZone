-- Enable realtime for app_settings table
ALTER TABLE app_settings REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE app_settings;