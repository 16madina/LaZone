-- Add property_id column to archived_conversations for proper conversation identification
ALTER TABLE public.archived_conversations 
ADD COLUMN property_id uuid;

-- Create unique constraint on the combination
ALTER TABLE public.archived_conversations
DROP CONSTRAINT IF EXISTS archived_conversations_user_id_other_user_id_key;

ALTER TABLE public.archived_conversations
ADD CONSTRAINT archived_conversations_unique_combo 
UNIQUE (user_id, other_user_id, property_id);

-- Update RLS policies to handle new structure (recreate them)
DROP POLICY IF EXISTS "Users can archive conversations" ON public.archived_conversations;
DROP POLICY IF EXISTS "Users can unarchive conversations" ON public.archived_conversations;
DROP POLICY IF EXISTS "Users can view their archived conversations" ON public.archived_conversations;

CREATE POLICY "Users can archive conversations" 
ON public.archived_conversations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unarchive conversations" 
ON public.archived_conversations 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their archived conversations" 
ON public.archived_conversations 
FOR SELECT 
USING (auth.uid() = user_id);