-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL CHECK (user_type IN ('particulier', 'agence')),
  first_name TEXT,
  last_name TEXT,
  agency_name TEXT,
  responsible_first_name TEXT,
  responsible_last_name TEXT,
  country TEXT,
  city TEXT,
  neighborhood TEXT,
  phone TEXT,
  agency_phone TEXT,
  responsible_mobile TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create listings table for property listings
CREATE TABLE public.listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL CHECK (purpose IN ('rent', 'sale')),
  property_type TEXT NOT NULL CHECK (property_type IN ('apartment', 'house', 'land')),
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(15,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'CFA',
  bedrooms INTEGER,
  bathrooms INTEGER,
  area DECIMAL(10,2) NOT NULL,
  land_area DECIMAL(10,2),
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  country TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'sold', 'rented')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Create policies for listings
CREATE POLICY "Anyone can view active listings" 
ON public.listings 
FOR SELECT 
USING (status = 'active');

CREATE POLICY "Users can view their own listings" 
ON public.listings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own listings" 
ON public.listings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings" 
ON public.listings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings" 
ON public.listings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY definer SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    user_type,
    first_name,
    last_name,
    agency_name,
    responsible_first_name,
    responsible_last_name,
    country,
    city,
    neighborhood,
    phone,
    agency_phone,
    responsible_mobile
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'user_type', 'particulier'),
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.raw_user_meta_data ->> 'agency_name',
    new.raw_user_meta_data ->> 'responsible_first_name',
    new.raw_user_meta_data ->> 'responsible_last_name',
    new.raw_user_meta_data ->> 'country',
    new.raw_user_meta_data ->> 'city',
    new.raw_user_meta_data ->> 'neighborhood',
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'agency_phone',
    new.raw_user_meta_data ->> 'responsible_mobile'
  );
  RETURN new;
END;
$$;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();