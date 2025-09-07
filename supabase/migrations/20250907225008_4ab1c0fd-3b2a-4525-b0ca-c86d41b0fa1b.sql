-- Activer Realtime sur la table listings pour les mises à jour en temps réel
ALTER TABLE public.listings REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.listings;