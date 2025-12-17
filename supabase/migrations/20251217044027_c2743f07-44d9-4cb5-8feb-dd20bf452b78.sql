-- Add phone number field to appointments table
ALTER TABLE public.appointments ADD COLUMN contact_phone text;
ALTER TABLE public.appointments ADD COLUMN share_phone boolean DEFAULT false;