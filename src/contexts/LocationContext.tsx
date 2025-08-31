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

  // Géocodage inversé réel utilisant l'API Nominatim (OpenStreetMap)
  const reverseGeocode = async (lat: number, lng: number): Promise<{ country?: string; city?: string }> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fr`
      );
      
      if (!response.ok) {
        throw new Error('Erreur API géocodage');
      }
      
      const data = await response.json();
      
      if (data && data.address) {
        let country = data.address.country;
        let city = data.address.city || data.address.town || data.address.village || data.address.state;
        
        // Traduction des noms de pays en français
        const countryTranslations: { [key: string]: string } = {
          'Ivory Coast': 'Côte d\'Ivoire',
          'Cote d\'Ivoire': 'Côte d\'Ivoire',
          'Senegal': 'Sénégal',
          'Nigeria': 'Nigeria',
          'Ghana': 'Ghana',
          'Cameroon': 'Cameroun',
          'Kenya': 'Kenya',
          'Morocco': 'Maroc',
          'Tunisia': 'Tunisie',
          'Egypt': 'Égypte',
          'South Africa': 'Afrique du Sud',
          'Ethiopia': 'Éthiopie',
          'Togo': 'Togo',
          'Benin': 'Bénin',
          'Mali': 'Mali',
          'Burkina Faso': 'Burkina Faso',
          'Niger': 'Niger',
          'Chad': 'Tchad',
          'Central African Republic': 'République Centrafricaine',
          'Democratic Republic of the Congo': 'République Démocratique du Congo',
          'Republic of the Congo': 'République du Congo',
          'Gabon': 'Gabon',
          'Equatorial Guinea': 'Guinée Équatoriale',
          'Guinea': 'Guinée',
          'Guinea-Bissau': 'Guinée-Bissau',
          'Sierra Leone': 'Sierra Leone',
          'Liberia': 'Liberia',
          'Algeria': 'Algérie',
          'Libya': 'Libye',
          'Sudan': 'Soudan',
          'South Sudan': 'Soudan du Sud',
          'Uganda': 'Ouganda',
          'Tanzania': 'Tanzanie',
          'Rwanda': 'Rwanda',
          'Burundi': 'Burundi',
          'Madagascar': 'Madagascar',
          'Mauritius': 'Maurice',
          'Seychelles': 'Seychelles',
          'Comoros': 'Comores',
          'Djibouti': 'Djibouti',
          'Somalia': 'Somalie',
          'Eritrea': 'Érythrée',
          'Mozambique': 'Mozambique',
          'Zimbabwe': 'Zimbabwe',
          'Zambia': 'Zambie',
          'Malawi': 'Malawi',
          'Botswana': 'Botswana',
          'Namibia': 'Namibie',
          'Angola': 'Angola',
          'Lesotho': 'Lesotho',
          'Swaziland': 'Eswatini',
          'France': 'France',
          'United States': 'États-Unis',
          'Canada': 'Canada',
          'United Kingdom': 'Royaume-Uni'
        };
        
        // Utiliser la traduction si disponible
        if (country && countryTranslations[country]) {
          country = countryTranslations[country];
        }
        
        return { country, city };
      }
      
      throw new Error('Données géocodage incomplètes');
      
    } catch (error) {
      console.error('Erreur géocodage inversé:', error);
      
      // Fallback avec zones géographiques étendues pour tous les continents
      return getFallbackLocation(lat, lng);
    }
  };

  // Système de fallback amélioré avec zones mondiales
  const getFallbackLocation = (lat: number, lng: number): { country?: string; city?: string } => {
    // Afrique de l'Ouest
    if (lat >= 4 && lat <= 16 && lng >= -18 && lng <= 3) {
      if (lng >= -6 && lng <= -2.5) return { country: 'Côte d\'Ivoire', city: 'Abidjan' };
      if (lng >= -18 && lng <= -15.5) return { country: 'Sénégal', city: 'Dakar' };
      if (lng >= 2.5 && lng <= 4.5) return { country: 'Nigeria', city: 'Lagos' };
      if (lng >= -1.5 && lng <= 0.5) return { country: 'Ghana', city: 'Accra' };
      return { country: 'Côte d\'Ivoire', city: 'Région Ouest' };
    }
    
    // Afrique Centrale
    if (lat >= -5 && lat <= 10 && lng >= 8 && lng <= 30) {
      if (lng >= 8.5 && lng <= 10.5) return { country: 'Cameroun', city: 'Douala' };
      return { country: 'Cameroun', city: 'Région Centrale' };
    }
    
    // Afrique de l'Est
    if (lat >= -12 && lat <= 15 && lng >= 30 && lng <= 52) {
      if (lat >= -2 && lat <= 5 && lng >= 36 && lng <= 41) return { country: 'Kenya', city: 'Nairobi' };
      if (lat >= 8 && lat <= 15 && lng >= 38 && lng <= 48) return { country: 'Éthiopie', city: 'Addis-Abeba' };
      return { country: 'Kenya', city: 'Région Est' };
    }
    
    // Afrique du Nord
    if (lat >= 30 && lat <= 37 && lng >= -12 && lng <= 35) {
      if (lng >= -8.5 && lng <= -6.5) return { country: 'Maroc', city: 'Casablanca' };
      if (lng >= 9.5 && lng <= 11.5) return { country: 'Tunisie', city: 'Tunis' };
      if (lng >= 30.5 && lng <= 32.5) return { country: 'Égypte', city: 'Le Caire' };
      return { country: 'Maroc', city: 'Région Nord' };
    }
    
    // Afrique du Sud
    if (lat >= -35 && lat <= -22 && lng >= 15 && lng <= 33) {
      return { country: 'Afrique du Sud', city: 'Johannesburg' };
    }
    
    // Europe
    if (lat >= 35 && lat <= 71 && lng >= -10 && lng <= 40) {
      return { country: 'France', city: 'Paris' };
    }
    
    // Amérique du Nord
    if (lat >= 25 && lat <= 70 && lng >= -170 && lng <= -50) {
      return { country: 'États-Unis', city: 'New York' };
    }
    
    // Amérique du Sud
    if (lat >= -55 && lat <= 15 && lng >= -85 && lng <= -35) {
      return { country: 'Brésil', city: 'São Paulo' };
    }
    
    // Asie
    if (lat >= -10 && lat <= 55 && lng >= 60 && lng <= 180) {
      return { country: 'Inde', city: 'New Delhi' };
    }
    
    // Fallback mondial - utiliser le pays le plus proche géographiquement
    if (lng >= -20 && lng <= 52 && lat >= -35 && lat <= 37) {
      return { country: 'Côte d\'Ivoire', city: 'Abidjan' };
    }
    
    return { country: 'Côte d\'Ivoire', city: 'Position inconnue' };
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
          selectedCountry: locationInfo.country || null, // Toujours utiliser le pays détecté
          selectedCity: locationInfo.city || null, // Toujours utiliser la ville détectée
          currency,
          coordinates: [longitude, latitude],
          isLocationDetected: true,
          showLocationPrompt: false
        }));
        
        // Persister la détection automatique
        if (locationInfo.country) {
          localStorage.setItem('lazone_selected_country', locationInfo.country);
        }
        if (locationInfo.city) {
          localStorage.setItem('lazone_selected_city', locationInfo.city);
        }
        
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