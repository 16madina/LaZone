-- Simplify the push notification trigger (edge function is now public)
CREATE OR REPLACE FUNCTION public.send_push_notification_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_title TEXT;
  notification_body TEXT;
  actor_name TEXT;
  notification_data JSONB;
  supabase_url TEXT := 'https://yzydlthexjbtdmacqzey.supabase.co';
BEGIN
  -- Get actor name from profiles
  SELECT full_name INTO actor_name
  FROM public.profiles
  WHERE user_id = NEW.actor_id;

  -- Build notification content based on type
  CASE NEW.type
    WHEN 'message' THEN
      notification_title := 'Nouveau message';
      notification_body := COALESCE(actor_name, 'Quelqu''un') || ' vous a envoyé un message';
    WHEN 'follow' THEN
      notification_title := 'Nouvel abonné';
      notification_body := COALESCE(actor_name, 'Quelqu''un') || ' a commencé à vous suivre';
    WHEN 'review' THEN
      notification_title := 'Nouvel avis';
      notification_body := COALESCE(actor_name, 'Quelqu''un') || ' vous a laissé un avis';
    ELSE
      notification_title := 'Nouvelle notification';
      notification_body := 'Vous avez une nouvelle notification';
  END CASE;

  -- Build data payload
  notification_data := jsonb_build_object(
    'type', NEW.type,
    'entity_id', NEW.entity_id,
    'actor_id', NEW.actor_id
  );

  -- Call edge function via pg_net (fire and forget, no auth needed)
  PERFORM net.http_post(
    url := supabase_url || '/functions/v1/send-push-notification',
    body := jsonb_build_object(
      'userId', NEW.user_id::text,
      'title', notification_title,
      'body', notification_body,
      'data', notification_data
    ),
    headers := '{"Content-Type": "application/json"}'::jsonb
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the transaction
    RAISE WARNING 'Failed to send push notification: %', SQLERRM;
    RETURN NEW;
END;
$$;