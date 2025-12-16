-- Allow users to view their own properties (including inactive ones)
CREATE POLICY "Users can view their own properties" 
ON public.properties 
FOR SELECT 
USING (auth.uid() = user_id);