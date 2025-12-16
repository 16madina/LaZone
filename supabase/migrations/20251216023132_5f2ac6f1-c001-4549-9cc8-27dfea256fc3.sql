-- Add email verification fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_token uuid DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS verification_token_expires_at timestamp with time zone DEFAULT (now() + interval '24 hours');

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_profiles_verification_token ON public.profiles(verification_token);
