-- Create function to handle admin conversations
CREATE OR REPLACE FUNCTION public.create_admin_conversation(target_user_id uuid, admin_user_id text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  conversation_id uuid;
BEGIN
  -- Check if conversation already exists with system as seller
  SELECT id INTO conversation_id
  FROM public.conversations
  WHERE buyer_id = target_user_id 
    AND seller_id::text = admin_user_id
  LIMIT 1;
  
  -- If no conversation exists, create one
  IF conversation_id IS NULL THEN
    INSERT INTO public.conversations (
      buyer_id,
      seller_id,
      listing_id,
      status
    ) VALUES (
      target_user_id,
      admin_user_id::uuid,
      gen_random_uuid(), -- Dummy listing ID for admin conversations
      'admin'
    ) RETURNING id INTO conversation_id;
  END IF;
  
  RETURN conversation_id;
END;
$$;