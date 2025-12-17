-- Create function to notify admins on user report
CREATE OR REPLACE FUNCTION public.notify_admins_on_user_report()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  admin_record RECORD;
  reporter_name TEXT;
  reported_name TEXT;
  supabase_url TEXT := 'https://yzydlthexjbtdmacqzey.supabase.co';
BEGIN
  -- Get reporter name
  SELECT full_name INTO reporter_name
  FROM public.profiles
  WHERE user_id = NEW.reporter_id;

  -- Get reported user name
  SELECT full_name INTO reported_name
  FROM public.profiles
  WHERE user_id = NEW.reported_user_id;

  -- Loop through all admins and send push notification
  FOR admin_record IN 
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  LOOP
    -- Send push notification to each admin
    PERFORM net.http_post(
      url := supabase_url || '/functions/v1/send-push-notification',
      body := jsonb_build_object(
        'userId', admin_record.user_id::text,
        'title', '🚨 Signalement utilisateur',
        'body', COALESCE(reporter_name, 'Un utilisateur') || ' a signalé ' || COALESCE(reported_name, 'un utilisateur'),
        'data', jsonb_build_object(
          'type', 'user_report',
          'report_id', NEW.id,
          'reported_user_id', NEW.reported_user_id
        )
      ),
      headers := '{"Content-Type": "application/json"}'::jsonb
    );
  END LOOP;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to send admin notification for user report: %', SQLERRM;
    RETURN NEW;
END;
$function$;

-- Create trigger for user reports
DROP TRIGGER IF EXISTS notify_admins_on_user_report_trigger ON public.user_reports;
CREATE TRIGGER notify_admins_on_user_report_trigger
  AFTER INSERT ON public.user_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admins_on_user_report();

-- Also create similar trigger for property reports
CREATE OR REPLACE FUNCTION public.notify_admins_on_property_report()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  admin_record RECORD;
  reporter_name TEXT;
  property_title TEXT;
  supabase_url TEXT := 'https://yzydlthexjbtdmacqzey.supabase.co';
BEGIN
  -- Get reporter name
  SELECT full_name INTO reporter_name
  FROM public.profiles
  WHERE user_id = NEW.reporter_id;

  -- Get property title
  SELECT title INTO property_title
  FROM public.properties
  WHERE id = NEW.property_id;

  -- Loop through all admins and send push notification
  FOR admin_record IN 
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  LOOP
    PERFORM net.http_post(
      url := supabase_url || '/functions/v1/send-push-notification',
      body := jsonb_build_object(
        'userId', admin_record.user_id::text,
        'title', '🚨 Signalement annonce',
        'body', COALESCE(reporter_name, 'Un utilisateur') || ' a signalé l''annonce: ' || COALESCE(property_title, 'Annonce'),
        'data', jsonb_build_object(
          'type', 'property_report',
          'report_id', NEW.id,
          'property_id', NEW.property_id
        )
      ),
      headers := '{"Content-Type": "application/json"}'::jsonb
    );
  END LOOP;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to send admin notification for property report: %', SQLERRM;
    RETURN NEW;
END;
$function$;

-- Create trigger for property reports
DROP TRIGGER IF EXISTS notify_admins_on_property_report_trigger ON public.property_reports;
CREATE TRIGGER notify_admins_on_property_report_trigger
  AFTER INSERT ON public.property_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admins_on_property_report();