-- Ajouter les politiques RLS pour permettre aux administrateurs de modifier les paramètres de l'app
CREATE POLICY "Admins can insert app settings" 
ON public.app_settings 
FOR INSERT 
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update app settings" 
ON public.app_settings 
FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete app settings" 
ON public.app_settings 
FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));