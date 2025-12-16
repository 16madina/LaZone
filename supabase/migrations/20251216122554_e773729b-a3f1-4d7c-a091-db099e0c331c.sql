-- Add country column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT;

-- Add country column to properties table  
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS country TEXT;