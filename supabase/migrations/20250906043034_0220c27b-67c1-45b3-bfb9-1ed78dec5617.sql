-- Créer une politique pour permettre la lecture publique des profils actifs
CREATE POLICY "Allow public access to active profiles"
ON public.profiles
FOR SELECT
TO public
USING (account_status = 'active');