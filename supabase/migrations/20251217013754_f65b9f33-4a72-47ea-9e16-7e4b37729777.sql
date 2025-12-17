-- Create function to notify on new message
CREATE OR REPLACE FUNCTION public.notify_on_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only create notification if sender is not the receiver
  IF NEW.sender_id != NEW.receiver_id THEN
    INSERT INTO public.notifications (user_id, type, actor_id, entity_id)
    VALUES (NEW.receiver_id, 'message', NEW.sender_id, NEW.id);
  END IF;
  RETURN NEW;
END;
$function$;

-- Create trigger for new messages
CREATE TRIGGER on_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_message();