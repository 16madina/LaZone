import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useGeolocation, GeolocationData } from '@/hooks/useGeolocation';

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
  const { data, loading, error, getCurrentPosition, countries } = useGeolocation();
  
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

  // Update state when geolocation data changes
  useEffect(() => {
    if (data && data.country) {
      const currency = CURRENCY_MAP[data.country] || 'CFA';
      setState(prev => ({
        ...prev,
        detectedCountry: data.country || null,
        detectedCity: data.city || null,
        selectedCountry: prev.selectedCountry || data.country || null,
        selectedCity: prev.selectedCity || data.city || null,
        currency,
        coordinates: [data.longitude, data.latitude],
        isLocationDetected: true,
        showLocationPrompt: false
      }));
      
      // Mark that user has seen the location prompt when location is detected
      localStorage.setItem('lazone_location_prompt_shown', 'true');
    }
  }, [data]);

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

  const requestLocation = () => {
    getCurrentPosition();
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