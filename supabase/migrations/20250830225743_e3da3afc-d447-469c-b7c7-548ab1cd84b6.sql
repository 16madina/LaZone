-- Créer la table properties
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  type TEXT NOT NULL CHECK (type IN ('apartment', 'house', 'villa', 'studio', 'duplex')),
  bedrooms INTEGER NOT NULL DEFAULT 0,
  bathrooms INTEGER NOT NULL DEFAULT 0,
  area DECIMAL(10,2) NOT NULL DEFAULT 1,
  address TEXT,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  neighborhood TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  images TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'rented', 'sold')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer Row Level Security
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS
-- Tout le monde peut voir les propriétés disponibles
CREATE POLICY "Les propriétés sont visibles par tous" 
ON public.properties 
FOR SELECT 
USING (true);

-- Les utilisateurs peuvent créer leurs propres annonces
CREATE POLICY "Les utilisateurs peuvent créer leurs annonces" 
ON public.properties 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent modifier leurs propres annonces
CREATE POLICY "Les utilisateurs peuvent modifier leurs annonces" 
ON public.properties 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Les utilisateurs peuvent supprimer leurs propres annonces
CREATE POLICY "Les utilisateurs peuvent supprimer leurs annonces" 
ON public.properties 
FOR DELETE 
USING (auth.uid() = user_id);

-- Créer un index pour les performances
CREATE INDEX idx_properties_user_id ON public.properties(user_id);
CREATE INDEX idx_properties_city ON public.properties(city);
CREATE INDEX idx_properties_country ON public.properties(country);
CREATE INDEX idx_properties_type ON public.properties(type);
CREATE INDEX idx_properties_created_at ON public.properties(created_at DESC);

-- Fonction pour mettre à jour les timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour la mise à jour automatique des timestamps
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();