-- Fonction pour assigner automatiquement le rôle admin aux emails autorisés
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger qui s'exécute après l'insertion d'un nouveau profil
CREATE TRIGGER assign_admin_role_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_admin_role_on_signup();

-- Si les profils existent déjà, assigner le rôle maintenant
INSERT INTO public.user_roles (user_id, role)
SELECT p.user_id, 'admin'::app_role
FROM public.profiles p
WHERE p.email IN ('16madina@gmail.com', 'lazoneclient@gmail.com')
ON CONFLICT (user_id, role) DO NOTHING;