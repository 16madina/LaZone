import { supabase } from '@/integrations/supabase/client';

export async function createListing(form: {
  title: string;
  price?: number;
  description?: string;
  country_code: 'CI' | 'SN' | 'CM' | 'ML' | 'BF' | string;
  city?: string; // Nom de la ville (requis par la DB)
  city_id?: string;
  neighborhood?: string;
  latitude: number;   // depuis le picker carte ou geocoding
  longitude: number;
  address?: string;
  images?: string[];
  property_type?: string;
  purpose?: 'rent' | 'sale' | 'commercial';
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  land_area?: number;
  amenities?: string[];
  currency?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Utilisateur non connecté');
  }

  const { data, error } = await supabase.from('listings').insert({
    user_id: user.id, // Le champ principal pour l'utilisateur
    title: form.title,
    description: form.description,
    price: form.price || 0,
    currency: form.currency || 'XOF',
    property_type: form.property_type || 'apartment',
    purpose: form.purpose || 'rent',
    bedrooms: form.bedrooms,
    bathrooms: form.bathrooms,
    area: form.area,
    land_area: form.land_area,
    amenities: form.amenities || [],
    status: 'active',
    city: form.city || 'Ville inconnue', // Requis par la DB
    country_code: form.country_code,
    city_id: form.city_id,
    neighborhood: form.neighborhood,
    latitude: form.latitude,
    longitude: form.longitude,
    address: form.address,
    images: form.images || []
  }).select('*').single();

  if (error) {
    console.error('Erreur lors de la création de l\'annonce:', error);
    throw error;
  }
  
  return data;
}

export async function getCitiesByCountry(countryCode: string) {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .eq('country_code', countryCode)
    .order('name');

  if (error) {
    console.error('Erreur lors de la récupération des villes:', error);
    throw error;
  }

  return data;
}

export async function getAllCountries() {
  const { data, error } = await supabase
    .from('cities')
    .select('country_code')
    .order('country_code');

  if (error) {
    console.error('Erreur lors de la récupération des pays:', error);
    throw error;
  }

  // Retourner les codes pays uniques
  const uniqueCountries = [...new Set(data.map(item => item.country_code))];
  
  // Mapper vers les noms complets
  const countryNames: Record<string, string> = {
    'CI': 'Côte d\'Ivoire',
    'SN': 'Sénégal',
    'ML': 'Mali',
    'BF': 'Burkina Faso',
    'CM': 'Cameroun'
  };

  return uniqueCountries.map(code => ({
    code,
    name: countryNames[code] || code
  }));
}