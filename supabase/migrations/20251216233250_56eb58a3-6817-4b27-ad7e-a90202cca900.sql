-- Add attachment support to messages table
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS attachment_url TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS attachment_type TEXT; -- 'image' or 'file'
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS attachment_name TEXT;