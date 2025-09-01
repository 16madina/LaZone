-- Allow everyone to read app_settings but only admins can modify
DROP POLICY IF EXISTS "Admins can manage app settings" ON app_settings;

CREATE POLICY "Everyone can read app settings" ON app_settings
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage app settings" ON app_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));