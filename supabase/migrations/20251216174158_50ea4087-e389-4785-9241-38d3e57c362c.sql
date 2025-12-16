-- Drop existing restrictive SELECT policies for properties
DROP POLICY IF EXISTS "Properties are viewable by everyone" ON public.properties;
DROP POLICY IF EXISTS "Users can view their own properties" ON public.properties;

-- Create PERMISSIVE policy for users to view ALL their own properties (active or inactive)
CREATE POLICY "Users can view their own properties"
ON public.properties
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create PERMISSIVE policy for everyone to view active properties
CREATE POLICY "Active properties are viewable by everyone"
ON public.properties
FOR SELECT
TO public
USING (is_active = true);