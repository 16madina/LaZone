-- Add reservation fields to appointments table for Residence mode
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS check_in_date date,
ADD COLUMN IF NOT EXISTS check_out_date date,
ADD COLUMN IF NOT EXISTS total_nights integer,
ADD COLUMN IF NOT EXISTS total_price numeric,
ADD COLUMN IF NOT EXISTS price_per_night numeric,
ADD COLUMN IF NOT EXISTS reservation_type text DEFAULT 'appointment';

-- Add comment for clarity
COMMENT ON COLUMN public.appointments.reservation_type IS 'appointment for LaZone mode, reservation for Residence mode';