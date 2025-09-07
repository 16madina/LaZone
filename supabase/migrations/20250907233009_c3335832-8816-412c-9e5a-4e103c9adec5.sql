-- Créer les buckets de storage pour les images des annonces
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('listing-images', 'listing-images', true),
  ('listing-videos', 'listing-videos', true),
  ('virtual-tours', 'virtual-tours', true);

-- Politiques RLS pour les images des annonces
CREATE POLICY "Anyone can view listing images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'listing-images');

CREATE POLICY "Authenticated users can upload listing images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'listing-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own listing images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own listing images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Politiques RLS pour les vidéos des annonces
CREATE POLICY "Anyone can view listing videos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'listing-videos');

CREATE POLICY "Authenticated users can upload listing videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'listing-videos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own listing videos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'listing-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own listing videos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'listing-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Politiques RLS pour les visites virtuelles
CREATE POLICY "Anyone can view virtual tours" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'virtual-tours');

CREATE POLICY "Authenticated users can upload virtual tours" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'virtual-tours' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own virtual tours" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'virtual-tours' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own virtual tours" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'virtual-tours' AND auth.uid()::text = (storage.foldername(name))[1]);