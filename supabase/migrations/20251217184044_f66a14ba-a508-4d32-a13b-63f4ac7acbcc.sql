-- Create a secure function to get user email by phone number for login
CREATE OR REPLACE FUNCTION public.get_user_email_by_phone(phone_number text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
  found_user_id uuid;
BEGIN
  -- Find user_id from profiles by phone number (with partial match for flexibility)
  SELECT user_id INTO found_user_id
  FROM profiles
  WHERE phone ILIKE '%' || phone_number
     OR phone ILIKE '%' || REPLACE(phone_number, '+', '')
     OR phone = phone_number
  LIMIT 1;
  
  IF found_user_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Get email from auth.users
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = found_user_id;
  
  RETURN user_email;
END;
$$;