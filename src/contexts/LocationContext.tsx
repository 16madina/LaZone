import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useCapacitor } from '@/hooks/useCapacitor';
import { toast } from '@/hooks/use-toast';

interface LocationState {
  detectedCountry: string | null;
  detectedCity: string | null;
  selectedCountry: string | null;
  selectedCity: string | null;
  currency: string;
  coordinates: [number, number] | null;
  isLocationDetected: boolean;
  showLocationPrompt: boolean;
}

interface LocationContextType extends LocationState {
  setSelectedCountry: (country: string | null) => void;
  setSelectedCity: (city: string | null) => void;
  requestLocation: () => void;
  dismissLocationPrompt: () => void;
  resetLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Currency mapping for African countries
const CURRENCY_MAP: { [key: string]: string } = {
  'Côte d\'Ivoire': 'CFA',
  'Sénégal': 'CFA',
  'Cameroun': 'CFA',
  'Togo': 'CFA',
  'Bénin': 'CFA',
  'Nigeria': 'NGN',
  'Ghana': 'GHS',
  'Kenya': 'KES',
  'Maroc': 'MAD',
  'Tunisie': 'TND',
  'Égypte': 'EGP',
  'Afrique du Sud': 'ZAR',
  'Éthiopie': 'ETB'
};

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const { getCurrentPosition, isNative } = useCapacitor();
  
  const [state, setState] = useState<LocationState>(() => {
    // Initialize state with data from localStorage if available
    const savedCountry = localStorage.getItem('lazone_selected_country');
    const savedCity = localStorage.getItem('lazone_selected_city');
    const hasSeenLocationPrompt = localStorage.getItem('lazone_location_prompt_shown') === 'true';
    const currency = savedCountry ? CURRENCY_MAP[savedCountry] || 'CFA' : 'CFA';
    
    return {
      detectedCountry: null,
      detectedCity: null,
      selectedCountry: savedCountry,
      selectedCity: savedCity,
      currency,
      coordinates: null,
      isLocationDetected: false,
      showLocationPrompt: !hasSeenLocationPrompt // Only show if user hasn't seen it before
    };
  });

  // Reverse geocoding amélioré avec zones plus larges
  const reverseGeocode = async (lat: number, lng: number): Promise<{ country?: string; city?: string }> => {
    // Zones précises
    if (lat >= 4.5 && lat <= 6.5 && lng >= -6.0 && lng <= -2.5) {
      return { country: 'Côte d\'Ivoire', city: 'Abidjan' };
    }
    if (lat >= 13.5 && lat <= 15.5 && lng >= -18.0 && lng <= -15.5) {
      return { country: 'Sénégal', city: 'Dakar' };
    }
    if (lat >= 5.5 && lat <= 7.5 && lng >= 2.5 && lng <= 4.5) {
      return { country: 'Nigeria', city: 'Lagos' };
    }
    if (lat >= 5.0 && lat <= 6.5 && lng >= -1.5 && lng <= 0.5) {
      return { country: 'Ghana', city: 'Accra' };
    }
    if (lat >= 3.0 && lat <= 5.0 && lng >= 8.5 && lng <= 10.5) {
      return { country: 'Cameroun', city: 'Douala' };
    }
    if (lat >= -2.0 && lat <= -0.5 && lng >= 36.0 && lng <= 37.5) {
      return { country: 'Kenya', city: 'Nairobi' };
    }
    if (lat >= 32.5 && lat <= 34.5 && lng >= -8.5 && lng <= -6.5) {
      return { country: 'Maroc', city: 'Casablanca' };
    }
    if (lat >= 35.5 && lat <= 37.5 && lng >= 9.5 && lng <= 11.5) {
      return { country: 'Tunisie', city: 'Tunis' };
    }
    if (lat >= 29.5 && lat <= 31.5 && lng >= 30.5 && lng <= 32.5) {
      return { country: 'Égypte', city: 'Le Caire' };
    }
    if (lat >= -27.0 && lat <= -25.5 && lng >= 27.0 && lng <= 29.0) {
      return { country: 'Afrique du Sud', city: 'Johannesburg' };
    }
    if (lat >= 8.5 && lat <= 9.5 && lng >= 38.5 && lng <= 39.5) {
      return { country: 'Éthiopie', city: 'Addis-Abeba' };
    }
    if (lat >= 6.0 && lat <= 7.0 && lng >= 0.5 && lng <= 1.5) {
      return { country: 'Togo', city: 'Lomé' };
    }
    if (lat >= 6.0 && lat <= 7.0 && lng >= 2.0 && lng <= 3.0) {
      return { country: 'Bénin', city: 'Cotonou' };
    }

    // Zones régionales plus larges pour l'Afrique
    if (lat >= -35 && lat <= 37 && lng >= -20 && lng <= 52) {
      // Détermination approximative par région
      if (lat >= 30 && lng >= -20 && lng <= 35) {
        return { country: 'Maroc', city: 'Région Nord' };
      }
      if (lat >= 15 && lat <= 30 && lng >= -20 && lng <= 25) {
        return { country: 'Sénégal', city: 'Région Ouest' };
      }
      if (lat >= 0 && lat <= 15 && lng >= -20 && lng <= 25) {
        return { country: 'Côte d\'Ivoire', city: 'Région Centrale' };
      }
      if (lat >= -35 && lat <= 0 && lng >= 15 && lng <= 35) {
        return { country: 'Afrique du Sud', city: 'Région Sud' };
      }
      if (lat >= 0 && lat <= 20 && lng >= 25 && lng <= 52) {
        return { country: 'Kenya', city: 'Région Est' };
      }
      
      // Fallback général pour l'Afrique
      return { country: 'Côte d\'Ivoire', city: 'Abidjan' };
    }
    
    // Fallback mondial - utiliser Côte d'Ivoire par défaut
    return { country: 'Côte d\'Ivoire', city: 'Abidjan' };
  };

  const setSelectedCountry = (country: string | null) => {
    const currency = country ? CURRENCY_MAP[country] || 'CFA' : 'CFA';
    setState(prev => ({
      ...prev,
      selectedCountry: country,
      selectedCity: null, // Reset city when country changes
      currency
    }));
    
    // Persist to localStorage
    if (country) {
      localStorage.setItem('lazone_selected_country', country);
      localStorage.removeItem('lazone_selected_city');
    } else {
      localStorage.removeItem('lazone_selected_country');
      localStorage.removeItem('lazone_selected_city');
    }
  };

  const setSelectedCity = (city: string | null) => {
    setState(prev => ({
      ...prev,
      selectedCity: city
    }));
    
    // Persist to localStorage
    if (city) {
      localStorage.setItem('lazone_selected_city', city);
    } else {
      localStorage.removeItem('lazone_selected_city');
    }
  };

  const requestLocation = async () => {
    try {
      toast({
        title: "Détection en cours...",
        description: "Recherche de votre position"
      });

      const position = await getCurrentPosition();
      
      if (position) {
        const { latitude, longitude } = position.coords;
        
        // Reverse geocoding
        const locationInfo = await reverseGeocode(latitude, longitude);
        
        const currency = CURRENCY_MAP[locationInfo.country] || 'CFA';
        setState(prev => ({
          ...prev,
          detectedCountry: locationInfo.country || null,
          detectedCity: locationInfo.city || null,
          selectedCountry: prev.selectedCountry || locationInfo.country || null,
          selectedCity: prev.selectedCity || locationInfo.city || null,
          currency,
          coordinates: [longitude, latitude],
          isLocationDetected: true,
          showLocationPrompt: false
        }));
        
        // Mark that user has seen the location prompt when location is detected
        localStorage.setItem('lazone_location_prompt_shown', 'true');
        
        toast({
          title: "Position détectée !",
          description: `${locationInfo.city}, ${locationInfo.country}`
        });
      }
    } catch (error) {
      console.error('Erreur géolocalisation:', error);
      toast({
        title: "Erreur de géolocalisation",
        description: "Impossible de détecter votre position",
        variant: "destructive"
      });
    }
  };

  const dismissLocationPrompt = () => {
    setState(prev => ({
      ...prev,
      showLocationPrompt: false
    }));
    
    // Mark that user has seen the location prompt
    localStorage.setItem('lazone_location_prompt_shown', 'true');
  };

  const resetLocation = () => {
    setState({
      detectedCountry: null,
      detectedCity: null,
      selectedCountry: null,
      selectedCity: null,
      currency: 'CFA',
      coordinates: null,
      isLocationDetected: false,
      showLocationPrompt: true
    });
  };

  const value: LocationContextType = {
    ...state,
    setSelectedCountry,
    setSelectedCity,
    requestLocation,
    dismissLocationPrompt,
    resetLocation
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};