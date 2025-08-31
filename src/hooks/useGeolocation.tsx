import { useState, useEffect } from 'react';
import { WORLDWIDE_COUNTRIES, getAllCountries } from '@/data/worldwideCountries';

export interface GeolocationData {
  latitude: number;
  longitude: number;
  country?: string;
  city?: string;
  accuracy?: number;
}

interface GeolocationState {
  data: GeolocationData | null;
  loading: boolean;
  error: string | null;
  permission: 'granted' | 'denied' | 'prompt' | 'unsupported';
}

// Reverse geocoding réel avec l'API Nominatim
const reverseGeocode = async (lat: number, lng: number): Promise<{ country?: string; city?: string }> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fr`
    );
    
    if (!response.ok) {
      throw new Error('Erreur lors de la géolocalisation inverse');
    }
    
    const data = await response.json();
    
    if (!data || !data.address) {
      return {};
    }
    
    const address = data.address;
    let country = address.country;
    let city = address.city || address.town || address.village || address.municipality;
    
    // Traductions françaises pour certains pays
    const countryTranslations: { [key: string]: string } = {
      'United States': 'États-Unis',
      'United Kingdom': 'Royaume-Uni',
      'Germany': 'Allemagne',
      'Spain': 'Espagne',
      'Italy': 'Italie',
      'Netherlands': 'Pays-Bas',
      'Switzerland': 'Suisse',
      'Belgium': 'Belgique',
      'Portugal': 'Portugal',
      'South Africa': 'Afrique du Sud',
      'Morocco': 'Maroc',
      'Tunisia': 'Tunisie',
      'Egypt': 'Égypte',
      'Kenya': 'Kenya',
      'Nigeria': 'Nigeria',
      'Ghana': 'Ghana',
      'Cameroon': 'Cameroun',
      'Senegal': 'Sénégal',
      'Ethiopia': 'Éthiopie',
      'Togo': 'Togo',
      'Benin': 'Bénin',
      'China': 'Chine',
      'Japan': 'Japon',
      'South Korea': 'Corée du Sud',
      'India': 'Inde',
      'Australia': 'Australie',
      'New Zealand': 'Nouvelle-Zélande',
      'Brazil': 'Brésil',
      'Argentina': 'Argentine',
      'Canada': 'Canada',
      'Mexico': 'Mexique',
    };
    
    // Utiliser la traduction si disponible
    if (country && countryTranslations[country]) {
      country = countryTranslations[country];
    }
    
    return {
      country: country || undefined,
      city: city || undefined
    };
    
  } catch (error) {
    console.error('Erreur lors du reverse geocoding:', error);
    return {};
  }
};

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    data: null,
    loading: false,
    error: null,
    permission: 'prompt'
  });

  const getCurrentPosition = async () => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'La géolocalisation n\'est pas supportée par ce navigateur',
        permission: 'unsupported',
        loading: false
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      });

      const { latitude, longitude, accuracy } = position.coords;
      
      // Reverse geocoding
      const locationInfo = await reverseGeocode(latitude, longitude);

      setState(prev => ({
        ...prev,
        data: {
          latitude,
          longitude,
          accuracy: accuracy || undefined,
          ...locationInfo
        },
        loading: false,
        permission: 'granted'
      }));

    } catch (error: any) {
      let errorMessage = 'Erreur lors de la détection de votre position';
      let permission: 'denied' | 'granted' = 'denied';

      if (error.code === 1) {
        errorMessage = 'Permission refusée pour accéder à votre position';
        permission = 'denied';
      } else if (error.code === 2) {
        errorMessage = 'Position non disponible';
      } else if (error.code === 3) {
        errorMessage = 'Délai d\'attente dépassé pour obtenir votre position';
      }

      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
        permission
      }));
    }
  };

  const reset = () => {
    setState({
      data: null,
      loading: false,
      error: null,
      permission: 'prompt'
    });
  };

  return {
    ...state,
    getCurrentPosition,
    reset,
    countries: getAllCountries()
  };
};