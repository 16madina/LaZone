-- Drop existing policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow read access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow update to own profile" ON public.profiles;

-- Create proper RLS policies for profiles table
CREATE POLICY "profiles_select_policy" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "profiles_insert_policy" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_policy" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow service role to bypass RLS for admin operations
CREATE POLICY "profiles_admin_policy" 
ON public.profiles 
FOR ALL 
USING (current_setting('role') = 'service_role');