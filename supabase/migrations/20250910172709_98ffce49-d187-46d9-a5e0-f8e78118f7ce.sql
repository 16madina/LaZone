-- Nettoyer les rôles d'administrateur orphelins (sans profil correspondant)
DELETE FROM public.user_roles 
WHERE user_id NOT IN (SELECT user_id FROM public.profiles);

-- Vérifier qu'il n'y a plus de rôles orphelins
-- Cette requête devrait retourner 0 lignes après le nettoyage