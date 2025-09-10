-- Ajouter l'email actuel à la liste des admins et assigner le rôle
CREATE OR REPLACE FUNCTION public.assign_admin_role_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier si l'email est dans la liste des admins autorisés
  IF NEW.email IN ('16madina@gmail.com', 'lazoneclient@gmail.com', 'user_f69583af@lazone.app') THEN
    -- Assigner le rôle d'administrateur
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Assigner immédiatement le rôle admin à l'utilisateur actuel
INSERT INTO public.user_roles (user_id, role)
VALUES ('f69583af-5b8a-4266-972c-4910f5761956', 'admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;