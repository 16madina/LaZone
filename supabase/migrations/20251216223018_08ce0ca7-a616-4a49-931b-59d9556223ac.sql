-- Create user_follows table for follower system
CREATE TABLE public.user_follows (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id uuid NOT NULL,
    following_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- Enable RLS
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Follows are viewable by everyone"
ON public.user_follows FOR SELECT
USING (true);

CREATE POLICY "Users can follow others"
ON public.user_follows FOR INSERT
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
ON public.user_follows FOR DELETE
USING (auth.uid() = follower_id);