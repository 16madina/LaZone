-- Create archived_conversations table
CREATE TABLE public.archived_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  other_user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, other_user_id)
);

-- Enable RLS
ALTER TABLE public.archived_conversations ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their archived conversations"
ON public.archived_conversations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can archive conversations"
ON public.archived_conversations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unarchive conversations"
ON public.archived_conversations FOR DELETE
USING (auth.uid() = user_id);

-- Add reply_to_id column to messages table
ALTER TABLE public.messages ADD COLUMN reply_to_id UUID REFERENCES public.messages(id) ON DELETE SET NULL;