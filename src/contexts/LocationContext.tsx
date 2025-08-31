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
        
        if (locationInfo.country) {
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
        } else {
          toast({
            title: "Position détectée",
            description: "Localisation hors zone de couverture",
            variant: "destructive"
          });
        }
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