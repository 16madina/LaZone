import { supabase } from '@/integrations/supabase/client';

export async function fetchListingsByCountry(countryCode: string) {
  const { data, error } = await supabase
    .from('listings')
    .select(`
      id, title, price, neighborhood, created_at, country_code, 
      latitude, longitude, city_id, images,
      cities(name, slug)
    `)
    .eq('country_code', countryCode)  // 'CI'
    .eq('status', 'active') // 'active' au lieu de 'published'
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Erreur lors de la récupération des annonces:', error);
    throw error;
  }
  
  return data ?? [];
}

// Fonction utilitaire pour récupérer toutes les annonces actives
export async function fetchAllActiveListings() {
  const { data, error } = await supabase
    .from('listings')
    .select(`
      id, title, price, neighborhood, created_at, country_code, 
      latitude, longitude, city_id, images,
      cities(name, slug)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Erreur lors de la récupération des annonces:', error);
    throw error;
  }
  
  return data ?? [];
}