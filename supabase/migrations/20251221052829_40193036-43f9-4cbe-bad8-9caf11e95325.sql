-- Add push_token column to profiles table
ALTER TABLE public.profiles ADD COLUMN push_token TEXT;

-- Migrate existing tokens from fcm_tokens to profiles (taking the most recent token per user)
UPDATE public.profiles p
SET push_token = (
  SELECT token FROM public.fcm_tokens f 
  WHERE f.user_id = p.user_id 
  ORDER BY updated_at DESC 
  LIMIT 1
)
WHERE EXISTS (SELECT 1 FROM public.fcm_tokens f WHERE f.user_id = p.user_id);