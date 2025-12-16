-- Create notifications table
CREATE TABLE public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    type text NOT NULL CHECK (type IN ('follow', 'review', 'message')),
    actor_id uuid NOT NULL,
    entity_id uuid,
    is_read boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
ON public.notifications FOR DELETE
USING (auth.uid() = user_id);

-- Function to create notification on follow
CREATE OR REPLACE FUNCTION public.notify_on_follow()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, actor_id, entity_id)
  VALUES (NEW.following_id, 'follow', NEW.follower_id, NEW.id);
  RETURN NEW;
END;
$$;

-- Trigger for follow notifications
CREATE TRIGGER on_new_follow
AFTER INSERT ON public.user_follows
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_follow();

-- Function to create notification on review
CREATE OR REPLACE FUNCTION public.notify_on_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, actor_id, entity_id)
  VALUES (NEW.reviewed_user_id, 'review', NEW.reviewer_id, NEW.id);
  RETURN NEW;
END;
$$;

-- Trigger for review notifications
CREATE TRIGGER on_new_review
AFTER INSERT ON public.user_reviews
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_review();