-- Corriger le problème de sécurité avec search_path
CREATE OR REPLACE FUNCTION public.assign_admin_role_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier si l'email est dans la liste des admins autorisés
  IF NEW.email IN ('16madina@gmail.com', 'lazoneclient@gmail.com') THEN
    -- Assigner le rôle d'administrateur
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;