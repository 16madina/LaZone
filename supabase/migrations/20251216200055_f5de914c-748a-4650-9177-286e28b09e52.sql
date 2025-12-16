-- Add WhatsApp authorization field to properties
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS whatsapp_enabled boolean DEFAULT false;