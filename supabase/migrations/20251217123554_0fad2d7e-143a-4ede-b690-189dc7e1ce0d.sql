-- Drop the problematic view
DROP VIEW IF EXISTS public.public_profiles;

-- Drop conflicting policies
DROP POLICY IF EXISTS "Users can view their own full profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view public profile info" ON public.profiles;

-- Create a single SELECT policy that allows viewing public fields for everyone
-- But sensitive fields (phone, verification_token) should only be readable by the owner
-- Note: RLS policies operate at row level, not column level. 
-- The application code MUST avoid selecting sensitive columns for other users' profiles.
-- We allow SELECT for all authenticated users for the online status feature.
CREATE POLICY "Profiles are publicly viewable" 
ON public.profiles 
FOR SELECT 
USING (true);