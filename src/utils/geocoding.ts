/**
 * Système de géocodage automatique pour les annonces
 */

// Coordonnées principales des villes africaines
export const CITY_COORDINATES = {
  // Côte d'Ivoire
  "Abidjan": { lat: 5.3600, lng: -4.0083 },
  "Abengourou": { lat: 6.7294, lng: -3.4968 },
  "Bouaké": { lat: 7.6906, lng: -5.0300 },
  "Daloa": { lat: 6.8775, lng: -6.4503 },
  "Yamoussoukro": { lat: 6.8276, lng: -5.2893 },
  "San Pedro": { lat: 4.7467, lng: -6.6364 },
  "Korhogo": { lat: 9.4580, lng: -5.6292 },
  "Man": { lat: 7.4125, lng: -7.5544 },
  "Gagnoa": { lat: 6.1319, lng: -5.9506 },
  "Marcory": { lat: 5.3167, lng: -4.0167 },

  // Sénégal
  "Dakar": { lat: 14.6928, lng: -17.4467 },
  "Thiès": { lat: 14.7886, lng: -16.9246 },
  "Kaolack": { lat: 14.1594, lng: -16.0720 },
  "Saint-Louis": { lat: 16.0199, lng: -16.4896 },
  
  // Ghana  
  "Accra": { lat: 5.6037, lng: -0.1870 },
  "Kumasi": { lat: 6.6885, lng: -1.6244 },
  "Tamale": { lat: 9.4034, lng: -0.8424 },
  
  // Nigeria
  "Lagos": { lat: 6.5244, lng: 3.3792 },
  "Abuja": { lat: 9.0765, lng: 7.3986 },
  "Kano": { lat: 12.0022, lng: 8.5920 },
  "Ibadan": { lat: 7.3775, lng: 3.9470 },
  "Port Harcourt": { lat: 4.8156, lng: 7.0498 },
  
  // Maroc
  "Casablanca": { lat: 33.5731, lng: -7.5898 },
  "Rabat": { lat: 34.0209, lng: -6.8417 },
  "Marrakech": { lat: 31.6295, lng: -7.9811 },
  "Fès": { lat: 34.0181, lng: -5.0078 },
  "Tanger": { lat: 35.7595, lng: -5.8340 },
  
  // Tunisie
  "Tunis": { lat: 36.8065, lng: 10.1815 },
  "Sfax": { lat: 34.7406, lng: 10.7603 },
  "Sousse": { lat: 35.8256, lng: 10.6411 },
  
  // Algérie
  "Alger": { lat: 36.7538, lng: 3.0588 },
  "Oran": { lat: 35.6969, lng: -0.6331 },
  "Constantine": { lat: 36.3650, lng: 6.6147 },
  
  // Kenya
  "Nairobi": { lat: -1.2921, lng: 36.8219 },
  "Mombasa": { lat: -4.0435, lng: 39.6682 },
  
  // Afrique du Sud
  "Le Cap": { lat: -33.9249, lng: 18.4241 },
  "Johannesburg": { lat: -26.2041, lng: 28.0473 },
  "Durban": { lat: -29.8587, lng: 31.0218 },
  
  // Égypte
  "Le Caire": { lat: 30.0444, lng: 31.2357 },
  "Alexandrie": { lat: 31.2001, lng: 29.9187 },
};

/**
 * Obtient les coordonnées d'une ville
 */
export const getCityCoordinates = (city: string, country?: string): { lat: number; lng: number } | null => {
  // Normaliser le nom de la ville
  const normalizedCity = city.trim().toLowerCase();
  
  // Rechercher dans notre base de données
  for (const [cityName, coords] of Object.entries(CITY_COORDINATES)) {
    if (cityName.toLowerCase() === normalizedCity) {
      return coords;
    }
  }
  
  // Si pas trouvé, essayer une correspondance partielle
  for (const [cityName, coords] of Object.entries(CITY_COORDINATES)) {
    if (cityName.toLowerCase().includes(normalizedCity) || normalizedCity.includes(cityName.toLowerCase())) {
      return coords;
    }
  }
  
  // Coordonnées par défaut selon le pays
  if (country) {
    const defaultCoords = getDefaultCoordinatesByCountry(country);
    if (defaultCoords) return defaultCoords;
  }
  
  return null;
};

/**
 * Coordonnées par défaut par pays
 */
const getDefaultCoordinatesByCountry = (country: string): { lat: number; lng: number } | null => {
  const normalizedCountry = country.toLowerCase();
  
  if (normalizedCountry.includes('côte') || normalizedCountry.includes('ivoire')) {
    return CITY_COORDINATES["Abidjan"];
  }
  
  if (normalizedCountry.includes('sénégal')) {
    return CITY_COORDINATES["Dakar"];
  }
  
  if (normalizedCountry.includes('ghana')) {
    return CITY_COORDINATES["Accra"];
  }
  
  if (normalizedCountry.includes('nigeria')) {
    return CITY_COORDINATES["Lagos"];
  }
  
  if (normalizedCountry.includes('maroc')) {
    return CITY_COORDINATES["Casablanca"];
  }
  
  if (normalizedCountry.includes('tunisie')) {
    return CITY_COORDINATES["Tunis"];
  }
  
  if (normalizedCountry.includes('algérie')) {
    return CITY_COORDINATES["Alger"];
  }
  
  if (normalizedCountry.includes('kenya')) {
    return CITY_COORDINATES["Nairobi"];
  }
  
  if (normalizedCountry.includes('afrique du sud')) {
    return CITY_COORDINATES["Le Cap"];
  }
  
  if (normalizedCountry.includes('égypte')) {
    return CITY_COORDINATES["Le Caire"];
  }
  
  return null;
};

/**
 * Géocode une adresse complète (pour les futures intégrations avec Mapbox)
 */
export const geocodeAddress = async (address: string, city: string, country: string, mapboxToken?: string): Promise<{ lat: number; lng: number } | null> => {
  // D'abord essayer notre base locale
  const cityCoords = getCityCoordinates(city, country);
  if (cityCoords) {
    return cityCoords;
  }
  
  // Si on a un token Mapbox, utiliser l'API de géocodage
  if (mapboxToken) {
    try {
      const query = `${address}, ${city}, ${country}`;
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&country=CI,SN,GH,NG,KE,TZ,UG,ET,EG,MA,DZ,TN,LY,SD,ML,BF,NE,TD,CF,CM,GQ,GA,CG,CD,AO,ZM,ZW,BW,NA,ZA,SZ,LS,MW,MZ,MG,MU,SC,KM,DJ,SO,ER,SS,RW,BI,GM,GW,SL,LR,GN,CV`
      );
      
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        return { lat, lng };
      }
    } catch (error) {
      console.warn('Mapbox geocoding failed:', error);
    }
  }
  
  return null;
};