import { useState, useEffect } from 'react';

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

const AFRICAN_COUNTRIES = [
  { code: 'CI', name: 'Côte d\'Ivoire', currency: 'CFA', cities: ['Abidjan', 'Bouaké', 'Daloa'] },
  { code: 'SN', name: 'Sénégal', currency: 'CFA', cities: ['Dakar', 'Thiès', 'Kaolack'] },
  { code: 'NG', name: 'Nigeria', currency: 'NGN', cities: ['Lagos', 'Kano', 'Ibadan'] },
  { code: 'GH', name: 'Ghana', currency: 'GHS', cities: ['Accra', 'Kumasi', 'Tamale'] },
  { code: 'CM', name: 'Cameroun', currency: 'CFA', cities: ['Douala', 'Yaoundé', 'Garoua'] },
  { code: 'KE', name: 'Kenya', currency: 'KES', cities: ['Nairobi', 'Mombasa', 'Kisumu'] },
  { code: 'MA', name: 'Maroc', currency: 'MAD', cities: ['Casablanca', 'Rabat', 'Marrakech'] },
  { code: 'TN', name: 'Tunisie', currency: 'TND', cities: ['Tunis', 'Sfax', 'Sousse'] },
  { code: 'EG', name: 'Égypte', currency: 'EGP', cities: ['Le Caire', 'Alexandrie', 'Giza'] },
  { code: 'ZA', name: 'Afrique du Sud', currency: 'ZAR', cities: ['Johannesburg', 'Le Cap', 'Durban'] },
  { code: 'ET', name: 'Éthiopie', currency: 'ETB', cities: ['Addis-Abeba', 'Dire Dawa', 'Mekelle'] },
  { code: 'TG', name: 'Togo', currency: 'CFA', cities: ['Lomé', 'Sokodé', 'Kara'] },
  { code: 'BJ', name: 'Bénin', currency: 'CFA', cities: ['Cotonou', 'Porto-Novo', 'Parakou'] }
];

// Reverse geocoding simulé basé sur les coordonnées
const reverseGeocode = async (lat: number, lng: number): Promise<{ country?: string; city?: string }> => {
  // Simulation basée sur des zones géographiques approximatives
  if (lat >= 5.0 && lat <= 6.0 && lng >= -5.5 && lng <= -3.0) {
    return { country: 'Côte d\'Ivoire', city: 'Abidjan' };
  }
  if (lat >= 14.0 && lat <= 15.0 && lng >= -17.5 && lng <= -16.0) {
    return { country: 'Sénégal', city: 'Dakar' };
  }
  if (lat >= 6.0 && lat <= 7.0 && lng >= 3.0 && lng <= 4.0) {
    return { country: 'Nigeria', city: 'Lagos' };
  }
  if (lat >= 5.5 && lat <= 6.0 && lng >= -1.0 && lng <= 0.0) {
    return { country: 'Ghana', city: 'Accra' };
  }
  if (lat >= 3.5 && lat <= 4.5 && lng >= 9.0 && lng <= 10.0) {
    return { country: 'Cameroun', city: 'Douala' };
  }
  if (lat >= -1.5 && lat <= -1.0 && lng >= 36.5 && lng <= 37.0) {
    return { country: 'Kenya', city: 'Nairobi' };
  }
  if (lat >= 33.0 && lat <= 34.0 && lng >= -8.0 && lng <= -7.0) {
    return { country: 'Maroc', city: 'Casablanca' };
  }
  if (lat >= 36.0 && lat <= 37.0 && lng >= 10.0 && lng <= 11.0) {
    return { country: 'Tunisie', city: 'Tunis' };
  }
  if (lat >= 30.0 && lat <= 31.0 && lng >= 31.0 && lng <= 32.0) {
    return { country: 'Égypte', city: 'Le Caire' };
  }
  if (lat >= -26.5 && lat <= -26.0 && lng >= 27.5 && lng <= 28.5) {
    return { country: 'Afrique du Sud', city: 'Johannesburg' };
  }
  
  // Fallback pour autres zones africaines
  if (lat >= -35 && lat <= 37 && lng >= -20 && lng <= 52) {
    return { country: 'Afrique', city: undefined };
  }
  
  return {};
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
    countries: AFRICAN_COUNTRIES
  };
};