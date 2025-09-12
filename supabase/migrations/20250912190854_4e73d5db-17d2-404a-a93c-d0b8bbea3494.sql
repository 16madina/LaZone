-- PHASE 1: CORRECTIONS DE SÉCURITÉ CRITIQUES

-- 1. Correction des politiques RLS de la table profiles
-- Supprimer la politique actuelle qui permet à tous de voir tous les profils
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Créer des politiques plus restrictives
-- Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Les utilisateurs peuvent voir les profils des agents/vendeurs dont ils consultent les annonces
-- Ceci permet l'affichage des informations d'agent sur les cartes de propriété
CREATE POLICY "Users can view seller profiles for listings" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.listings 
    WHERE listings.user_id = profiles.user_id 
    AND listings.status = 'active'
  )
);

-- Les utilisateurs peuvent voir les profils avec lesquels ils ont des conversations
CREATE POLICY "Users can view profiles in conversations" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.conversations 
    WHERE (conversations.buyer_id = auth.uid() AND conversations.seller_id = profiles.user_id)
    OR (conversations.seller_id = auth.uid() AND conversations.buyer_id = profiles.user_id)
  )
);

-- 2. Sécurisation des logs de sécurité - Restreindre l'accès aux admins seulement
DROP POLICY IF EXISTS "Users can view their own security events" ON public.security_audit_log;

-- Seuls les admins peuvent voir tous les logs de sécurité
CREATE POLICY "Only admins can view security logs" 
ON public.security_audit_log 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Les utilisateurs peuvent voir uniquement leurs propres événements de sécurité
CREATE POLICY "Users can view their own security events" 
ON public.security_audit_log 
FOR SELECT 
USING (auth.uid() = user_id AND user_id IS NOT NULL);

-- 3. Ajout des index critiques manquants pour les performances

-- Index composite pour les listings (recherches fréquentes)
CREATE INDEX IF NOT EXISTS idx_listings_user_status_created 
ON public.listings (user_id, status, created_at DESC);

-- Index composite pour les listings actifs avec géolocalisation
CREATE INDEX IF NOT EXISTS idx_listings_status_location 
ON public.listings (status, latitude, longitude) 
WHERE status = 'active';

-- Index pour les recherches par ville et quartier
CREATE INDEX IF NOT EXISTS idx_listings_location_search 
ON public.listings (city, neighborhood, status) 
WHERE status = 'active';

-- Index pour les conversations (tri par dernière activité)
CREATE INDEX IF NOT EXISTS idx_conversations_participants_activity 
ON public.conversations (buyer_id, seller_id, last_message_at DESC);

-- Index pour les messages par conversation (tri chronologique)
CREATE INDEX IF NOT EXISTS idx_messages_conversation_time 
ON public.messages (conversation_id, created_at DESC);

-- Index pour les favoris par utilisateur
CREATE INDEX IF NOT EXISTS idx_favorites_user_created 
ON public.favorites (user_id, created_at DESC);

-- Index pour les métriques de performance par utilisateur
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_time 
ON public.performance_metrics (user_id, created_at DESC) 
WHERE user_id IS NOT NULL;

-- Index pour les événements analytics par type et temps
CREATE INDEX IF NOT EXISTS idx_analytics_events_type_time 
ON public.analytics_events (event_type, created_at DESC);

-- Index pour les rôles utilisateurs
CREATE INDEX IF NOT EXISTS idx_user_roles_user_role 
ON public.user_roles (user_id, role);