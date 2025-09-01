-- Fix the INSERT policy for favorites table
DROP POLICY IF EXISTS "Users can add their own favorites" ON public.favorites;

CREATE POLICY "Users can add their own favorites" 
ON public.favorites 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);