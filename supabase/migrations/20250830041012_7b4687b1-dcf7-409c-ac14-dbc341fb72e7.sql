-- Créer les buckets de stockage pour vidéos et vues 360°
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('listing-videos', 'listing-videos', true),
  ('virtual-tours', 'virtual-tours', true);

-- Créer les politiques RLS pour les vidéos
CREATE POLICY "Listing videos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'listing-videos');

CREATE POLICY "Users can upload their own listing videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'listing-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own listing videos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'listing-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own listing videos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'listing-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Créer les politiques RLS pour les vues 360°
CREATE POLICY "Virtual tours are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'virtual-tours');

CREATE POLICY "Users can upload their own virtual tours" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'virtual-tours' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own virtual tours" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'virtual-tours' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own virtual tours" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'virtual-tours' AND auth.uid()::text = (storage.foldername(name))[1]);