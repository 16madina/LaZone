import { useState, useEffect } from 'react';
import { africanCountries, Country } from '@/data/africanCountries';

const STORAGE_KEY = 'lazone_geo_country';

export const useGeoCountry = () => {
  const [detectedCountry, setDetectedCountry] = useState<Country | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [showAllCountries, setShowAllCountries] = useState(false);

  useEffect(() => {
    // Check if we already have a cached country
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      if (cached === 'ALL') {
        setShowAllCountries(true);
        setDetectedCountry(null);
        setLoading(false);
        return;
      }
      const country = africanCountries.find(c => c.code === cached);
      if (country) {
        setDetectedCountry(country);
        setLoading(false);
        return;
      }
    }

    // Request geolocation
    if (!navigator.geolocation) {
      // No geolocation support - show all countries
      setShowAllCountries(true);
      localStorage.setItem(STORAGE_KEY, 'ALL');
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
          
          // If country not found in African countries, show all countries
          setShowAllCountries(true);
          localStorage.setItem(STORAGE_KEY, 'ALL');
        } catch (error) {
          console.error('Error detecting country:', error);
          setShowAllCountries(true);
          localStorage.setItem(STORAGE_KEY, 'ALL');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.log('Geolocation error:', error.message);
        setPermissionDenied(error.code === error.PERMISSION_DENIED);
        
        // Permission denied or error - show all countries
        setShowAllCountries(true);
        localStorage.setItem(STORAGE_KEY, 'ALL');
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

  return { detectedCountry, loading, permissionDenied, showAllCountries, clearCache };
};
