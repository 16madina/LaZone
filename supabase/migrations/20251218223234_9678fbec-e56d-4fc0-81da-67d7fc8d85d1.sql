-- Create a function to send push notifications via edge function
CREATE OR REPLACE FUNCTION public.trigger_push_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor_name TEXT;
  notification_title TEXT;
  notification_body TEXT;
BEGIN
  -- Get actor name
  SELECT full_name INTO actor_name 
  FROM profiles 
  WHERE user_id = NEW.actor_id;
  
  IF actor_name IS NULL THEN
    actor_name := 'Quelqu''un';
  END IF;

  -- Build notification content based on type
  CASE NEW.type
    WHEN 'follow' THEN
      notification_title := 'Nouveau follower';
      notification_body := actor_name || ' a commencé à vous suivre';
    WHEN 'review' THEN
      notification_title := 'Nouvel avis';
      notification_body := actor_name || ' vous a laissé un avis';
    WHEN 'message' THEN
      notification_title := 'Nouveau message';
      notification_body := actor_name || ' vous a envoyé un message';
    ELSE
      notification_title := 'LaZone';
      notification_body := 'Nouvelle notification';
  END CASE;

  -- Call edge function via pg_net extension (async HTTP request)
  -- Note: This requires pg_net extension to be enabled
  PERFORM net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/send-push-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.supabase_service_role_key')
    ),
    body := jsonb_build_object(
      'userId', NEW.user_id,
      'title', notification_title,
      'body', notification_body,
      'data', jsonb_build_object(
        'type', NEW.type,
        'actor_id', NEW.actor_id,
        'entity_id', COALESCE(NEW.entity_id, ''),
        'notification_id', NEW.id
      )
    )
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the transaction
    RAISE WARNING 'Failed to send push notification: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger to send push notification on new notification
DROP TRIGGER IF EXISTS send_push_notification_trigger ON notifications;
CREATE TRIGGER send_push_notification_trigger
  AFTER INSERT ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION trigger_push_notification();