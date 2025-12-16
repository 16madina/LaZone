-- Create user_reviews table for ratings and comments
CREATE TABLE public.user_reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reviewer_id uuid NOT NULL,
    reviewed_user_id uuid NOT NULL,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(reviewer_id, reviewed_user_id)
);

-- Enable RLS
ALTER TABLE public.user_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Reviews are viewable by everyone"
ON public.user_reviews FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create reviews"
ON public.user_reviews FOR INSERT
WITH CHECK (auth.uid() = reviewer_id AND auth.uid() != reviewed_user_id);

CREATE POLICY "Users can update their own reviews"
ON public.user_reviews FOR UPDATE
USING (auth.uid() = reviewer_id);

CREATE POLICY "Users can delete their own reviews"
ON public.user_reviews FOR DELETE
USING (auth.uid() = reviewer_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_reviews_updated_at
BEFORE UPDATE ON public.user_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();