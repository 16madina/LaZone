-- Add is_canvasser column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_canvasser boolean DEFAULT false;