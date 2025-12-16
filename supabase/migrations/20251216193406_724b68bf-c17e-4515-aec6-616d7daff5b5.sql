-- Allow admins and moderators to view ALL properties (including inactive ones)
CREATE POLICY "Admins can view all properties"
ON public.properties
FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));

-- Allow admins to update any property (for sponsoring, etc.)
CREATE POLICY "Admins can update any property"
ON public.properties
FOR UPDATE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));

-- Allow admins to delete any property
CREATE POLICY "Admins can delete any property"
ON public.properties
FOR DELETE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));