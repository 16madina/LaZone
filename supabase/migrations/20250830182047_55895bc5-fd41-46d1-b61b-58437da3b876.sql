-- S'assurer que l'utilisateur actuel a le rôle admin pour les tests
-- Note: Remplacez 'f6873620-3d3e-4636-b74d-531721463a03' par votre ID utilisateur réel si différent

INSERT INTO public.user_roles (user_id, role) 
VALUES ('f6873620-3d3e-4636-b74d-531721463a03', 'admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;