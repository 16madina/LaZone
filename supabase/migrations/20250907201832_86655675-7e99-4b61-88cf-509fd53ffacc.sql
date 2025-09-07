-- Fix security issue: set search_path for the function
DROP FUNCTION IF EXISTS public.log_security_event;

CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id UUID,
  p_action_type TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_success BOOLEAN DEFAULT true,
  p_error_message TEXT DEFAULT NULL
)
RETURNS UUID 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
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
$$;