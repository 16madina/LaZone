-- Ajouter des champs pour la gestion des comptes (bannissement, status)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS account_status text DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'banned')),
ADD COLUMN IF NOT EXISTS banned_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS ban_reason text,
ADD COLUMN IF NOT EXISTS banned_by uuid;

-- Mettre à jour l'enum pour inclure le rôle modérateur si ce n'est pas déjà fait
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role' AND typcategory = 'E') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
    ELSE
        -- Vérifier si 'moderator' existe déjà dans l'enum
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'app_role') 
            AND enumlabel = 'moderator'
        ) THEN
            ALTER TYPE public.app_role ADD VALUE 'moderator';
        END IF;
    END IF;
END $$;

-- Créer une table pour l'historique des actions d'administration
CREATE TABLE IF NOT EXISTS public.admin_actions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    target_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    action_type text NOT NULL CHECK (action_type IN ('ban', 'unban', 'suspend', 'activate', 'promote', 'demote', 'delete', 'message')),
    reason text,
    details jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS sur la nouvelle table
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- Politique pour que seuls les admins puissent voir et modifier les actions
CREATE POLICY "Admins can manage admin actions" 
ON public.admin_actions 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON public.profiles(account_status);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target_user ON public.admin_actions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON public.admin_actions(created_at DESC);