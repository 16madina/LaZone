-- Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS agency_name TEXT,
ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'individual',
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active';

-- Add missing columns to listings table  
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS land_documents TEXT[],
ADD COLUMN IF NOT EXISTS additional_info TEXT;

-- Ensure address column exists (it should be there but just in case)
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS address TEXT;

-- Update user_type column to have proper constraint
UPDATE public.profiles SET user_type = 'individual' WHERE user_type IS NULL;

-- Create security_audit_log table for OTP functions
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  action_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on security_audit_log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Create policy for security_audit_log
CREATE POLICY "Users can view their own security events" 
ON public.security_audit_log 
FOR SELECT 
USING (auth.uid()::text = user_id::text OR user_id IS NULL);

-- Create policy for inserting security events (allow system inserts)
CREATE POLICY "System can insert security events" 
ON public.security_audit_log 
FOR INSERT 
WITH CHECK (true);

-- Create the log_security_event function
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id UUID,
  p_action_type TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_success BOOLEAN DEFAULT true,
  p_error_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    action_type,
    resource_type,
    resource_id,
    success,
    error_message
  ) VALUES (
    p_user_id,
    p_action_type,
    p_resource_type,
    p_resource_id,
    p_success,
    p_error_message
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;