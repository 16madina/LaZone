import { useState, useEffect } from 'react';
import { africanCountries, Country } from '@/data/africanCountries';

const STORAGE_KEY = 'lazone_geo_country';

export const useGeoCountry = () => {
  const [detectedCountry, setDetectedCountry] = useState<Country | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    // Check if we already have a cached country
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const country = africanCountries.find(c => c.code === cached);
      if (country) {
        setDetectedCountry(country);
        setLoading(false);
        return;
      }
    }

    // Request geolocation
    if (!navigator.geolocation) {
      // Fallback to Côte d'Ivoire
      const defaultCountry = africanCountries.find(c => c.code === 'CI');
      setDetectedCountry(defaultCountry || null);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Use OpenStreetMap Nominatim for reverse geocoding (free, no API key needed)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=3`,
            {
              headers: {
                'Accept-Language': 'en',
              },
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            const countryCode = data.address?.country_code?.toUpperCase();
            
            if (countryCode) {
              const country = africanCountries.find(c => c.code === countryCode);
              if (country) {
                localStorage.setItem(STORAGE_KEY, countryCode);
                setDetectedCountry(country);
                setLoading(false);
                return;
              }
            }
          }
          
          // If country not found in African countries, fallback to CI
          const defaultCountry = africanCountries.find(c => c.code === 'CI');
          setDetectedCountry(defaultCountry || null);
        } catch (error) {
          console.error('Error detecting country:', error);
          const defaultCountry = africanCountries.find(c => c.code === 'CI');
          setDetectedCountry(defaultCountry || null);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.log('Geolocation error:', error.message);
        setPermissionDenied(error.code === error.PERMISSION_DENIED);
        
        // Fallback to Côte d'Ivoire
        const defaultCountry = africanCountries.find(c => c.code === 'CI');
        setDetectedCountry(defaultCountry || null);
        setLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 86400000, // 24 hours
      }
    );
  }, []);

  const clearCache = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  return { detectedCountry, loading, permissionDenied, clearCache };
};
