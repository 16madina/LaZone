import React, { useEffect, useRef, useState, useImperativeHandle } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Property } from './PropertyCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Layers, Maximize2, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AFRICAN_CITIES_DATA, searchCities, searchNeighborhoods } from '@/data/africanCities';
import { logger } from '@/utils/logger';

interface PropertyMapProps {
  properties: Property[];
  selectedProperty?: Property | null;
  onPropertySelect: (property: Property) => void;
  onMapBoundsChange?: (bounds: google.maps.LatLngBounds) => void;
  onNavigateToLocation?: (coordinates: [number, number], zoom: number) => void;
  className?: string;
  apiKey?: string;
  userLocation?: [number, number] | null;
}

const PropertyMap = React.forwardRef<
  { navigateToLocation: (coords: [number, number], zoom: number) => void },
  PropertyMapProps
>(function PropertyMap({ 
  properties, 
  selectedProperty,
  onPropertySelect,
  onMapBoundsChange,
  onNavigateToLocation,
  className = '',
  apiKey,
  userLocation
}, ref) {
  console.log('🗺️ PropertyMap component initializing...', { 
    propertiesCount: properties.length,
    hasUserLocation: !!userLocation 
  });
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const markers = useRef<google.maps.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [googleMapsKey, setGoogleMapsKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<Array<{type: 'city' | 'neighborhood', name: string, country: string, city?: string}>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const geocoder = useRef<google.maps.Geocoder | null>(null);
  const infoWindow = useRef<google.maps.InfoWindow | null>(null);

  // Fetch Google Maps API key from Supabase Edge Function
  useEffect(() => {
    console.log('🔑 PropertyMap: Starting API key fetch process...');
    const fetchGoogleMapsKey = async () => {
      try {
        logger.debug('Starting Google Maps API key fetch', { component: 'PropertyMap' });
        
        // Use provided apiKey if available
        if (apiKey) {
          logger.debug('Using provided API key', { component: 'PropertyMap' });
          setGoogleMapsKey(apiKey);
          setIsLoading(false);
          return;
        }

        // Otherwise, fetch from Supabase Edge Function
        logger.debug('Fetching API key from Supabase Edge Function', { component: 'PropertyMap' });
        const { data, error } = await supabase.functions.invoke('get-google-maps-key');
        
        if (error) {
          logger.error('Edge function error', new Error(error.message), { component: 'PropertyMap' });
          throw new Error(`Edge function error: ${error.message}`);
        }
        
        if (data?.googleMapsKey) {
          logger.debug('API key received successfully', { 
            component: 'PropertyMap',
            keyLength: data.googleMapsKey.length,
            keyPrefix: data.googleMapsKey.substring(0, 10) + '...'
          });
          setGoogleMapsKey(data.googleMapsKey);
        } else {
          logger.error('No API key in response data', new Error('Missing API key in response'), { component: 'PropertyMap', data });
          setError('Clé Google Maps non disponible dans la réponse');
        }
      } catch (err) {
        logger.error('Error fetching Google Maps API key', err as Error, { component: 'PropertyMap' });
        setError(`Erreur lors du chargement de la carte: ${(err as Error).message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGoogleMapsKey();
  }, [apiKey]);

  // Handle search input and generate suggestions
  const handleSearchChange = (value: string) => {
    logger.debug('Search input', { component: 'PropertyMap', searchQuery: value });
    setSearchQuery(value);
    
    if (value.length < 1) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const suggestions: Array<{type: 'city' | 'neighborhood', name: string, country: string, city?: string}> = [];

    // Search in all African countries
    AFRICAN_CITIES_DATA.forEach(country => {
      // Search cities
      const cities = searchCities(country.name, value);
      cities.forEach(cityName => {
        suggestions.push({
          type: 'city',
          name: cityName,
          country: country.name
        });
      });

      // Search neighborhoods
      country.cities.forEach(city => {
        const neighborhoods = searchNeighborhoods(country.name, city.name, value);
        neighborhoods.forEach(neighborhoodName => {
          suggestions.push({
            type: 'neighborhood',
            name: neighborhoodName,
            country: country.name,
            city: city.name
          });
        });
      });
    });

    logger.debug('Search suggestions generated', { 
      component: 'PropertyMap', 
      suggestionsCount: suggestions.length 
    });
    // Limit suggestions to 8 for better UX
    setSearchSuggestions(suggestions.slice(0, 8));
    setShowSuggestions(suggestions.length > 0);
  };

  // Navigate to selected location
  const handleLocationSelect = async (suggestion: {type: 'city' | 'neighborhood', name: string, country: string, city?: string}) => {
    if (!map.current || !geocoder.current) {
      logger.warn('Map or geocoder not ready for navigation', { component: 'PropertyMap' });
      return;
    }

    logger.debug('Navigating to location', { component: 'PropertyMap', location: suggestion });
    setSearchQuery(suggestion.name);
    setShowSuggestions(false);

    try {
      const address = suggestion.type === 'city' 
        ? `${suggestion.name}, ${suggestion.country}` 
        : `${suggestion.name}, ${suggestion.city}, ${suggestion.country}`;

      geocoder.current.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          const zoom = suggestion.type === 'city' ? 11 : 14;
          
          logger.debug('Flying to coordinates', { 
            component: 'PropertyMap', 
            coordinates: [location.lng(), location.lat()], 
            zoom 
          });
          
          map.current?.panTo(location);
          map.current?.setZoom(zoom);
          
          logger.debug('Navigation completed', { component: 'PropertyMap' });
        } else {
          logger.warn('No geocoding results found', { component: 'PropertyMap', suggestion, status });
        }
      });
    } catch (error) {
      logger.error('Error geocoding location', error as Error, { 
        component: 'PropertyMap', 
        suggestion 
      });
    }
  };

  // Expose navigation method
  useImperativeHandle(ref, () => ({
    navigateToLocation: (coords: [number, number], zoom: number) => {
      if (map.current) {
        map.current.panTo({ lat: coords[1], lng: coords[0] });
        map.current.setZoom(zoom);
        if (onNavigateToLocation) {
          onNavigateToLocation(coords, zoom);
        }
      }
    }
  }));

  // Initialize Google Maps
  useEffect(() => {
    if (!googleMapsKey || isLoading) {
      logger.debug('Map initialization skipped', { 
        component: 'PropertyMap',
        hasKey: !!googleMapsKey,
        isLoading 
      });
      return;
    }

    const initMap = async () => {
      if (!mapContainer.current) {
        logger.debug('Map container not ready, retrying', { component: 'PropertyMap' });
        setTimeout(initMap, 100);
        return;
      }

      logger.info('Starting Google Maps initialization', { 
        component: 'PropertyMap',
        keyPrefix: googleMapsKey.substring(0, 10),
        keyLength: googleMapsKey.length,
        containerReady: !!mapContainer.current
      });

      try {
        // Initialize Google Maps loader
        const loader = new Loader({
          apiKey: googleMapsKey,
          version: 'weekly',
          libraries: ['geometry', 'places']
        });

        logger.info('Loading Google Maps API...', { 
          component: 'PropertyMap',
          apiKey: googleMapsKey.substring(0, 15) + '...',
          domain: window.location.hostname
        });

        console.log('🗺️ Tentative de chargement de l\'API Google Maps...');
        console.log('🔑 Clé API utilisée:', googleMapsKey.substring(0, 15) + '...');
        console.log('🌐 Domaine actuel:', window.location.hostname);
        console.log('🌍 URL complète:', window.location.href);
        
        await loader.load();

        console.log('✅ API Google Maps chargée avec succès !');
        logger.debug('Creating Google Maps instance', { component: 'PropertyMap' });

        // Create map with Africa-focused configuration
        map.current = new google.maps.Map(mapContainer.current, {
          center: { lat: 7.2, lng: 17.7 }, // Centre de l'Afrique
          zoom: 3,
          minZoom: 2,
          maxZoom: 18,
          restriction: {
            latLngBounds: {
              north: 38,
              south: -40,
              west: -25,
              east: 55
            }
          },
          styles: [
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#e9e9e9' }]
            },
            {
              featureType: 'landscape',
              elementType: 'geometry',
              stylers: [{ color: '#f5f5f5' }]
            }
          ]
        });

        // Initialize geocoder and info window
        geocoder.current = new google.maps.Geocoder();
        infoWindow.current = new google.maps.InfoWindow();

        logger.info('Google Maps loaded successfully', { component: 'PropertyMap' });
        setMapLoaded(true);
        setError(null);
        
        // Center map on user location if available (only if in Africa)
        if (userLocation && map.current) {
          const [lng, lat] = userLocation;
          logger.debug('Checking user location for map center', { 
            component: 'PropertyMap', 
            userLocation: [lng, lat] 
          });
          
          // Vérifier si la localisation est en Afrique
          if (lng >= -25 && lng <= 55 && lat >= -40 && lat <= 38) {
            logger.info('Setting center to user location', { component: 'PropertyMap', coords: [lng, lat] });
            map.current.panTo({ lat, lng });
            map.current.setZoom(12);
          } else {
            logger.info('User location outside Africa, keeping default center', { 
              component: 'PropertyMap',
              userLocation 
            });
          }
        }

        // Listen for map movements
        map.current.addListener('bounds_changed', () => {
          if (map.current && onMapBoundsChange) {
            const bounds = map.current.getBounds();
            if (bounds) {
              onMapBoundsChange(bounds);
            }
          }
        });

      } catch (error) {
        const errorMessage = (error as Error).message;
        logger.error('Error initializing Google Maps', error as Error, { 
          component: 'PropertyMap', 
          keyPrefix: googleMapsKey.substring(0, 10),
          errorStack: (error as Error).stack,
          domain: window.location.hostname,
          userAgent: navigator.userAgent
        });
        
        let userFriendlyError = 'Erreur lors du chargement de Google Maps';
        
        if (errorMessage.includes('RefererNotAllowedMapError') || errorMessage.includes('InvalidKeyMapError')) {
          userFriendlyError = `🔧 Erreur de configuration de la clé API Google Maps
          
Solutions possibles :
• La clé API doit autoriser le domaine: ${window.location.hostname}  
• Vérifiez que les APIs Google Maps JavaScript sont activées
• Contrôlez les quotas et limites dans Google Cloud Console

📋 Informations de débogage :
• Domaine: ${window.location.hostname}
• Clé: ${googleMapsKey.substring(0, 15)}...
• Erreur: ${errorMessage}`;
        } else if (errorMessage.includes('loading') || errorMessage.includes('load')) {
          userFriendlyError = `🌐 Impossible de charger l'API Google Maps
          
Causes possibles :
• Connexion internet instable
• Clé API expirée ou révoquée  
• Services Google Maps temporairement indisponibles
• Blocage par pare-feu/proxy

📋 Détails techniques : ${errorMessage}`;
        } else {
          userFriendlyError = `Erreur d'initialisation Google Maps: ${errorMessage}
          
📋 Pour résoudre ce problème :
1. Vérifiez votre clé API Google Maps
2. Contrôlez les restrictions de domaine  
3. Assurez-vous que tous les services sont activés`;
        }
        
        setError(userFriendlyError);
        setMapLoaded(false);
      }
    };

    initMap();

    return () => {
      // Google Maps cleanup is handled automatically
      map.current = null;
      geocoder.current = null;
      infoWindow.current = null;
    };
  }, [googleMapsKey, isLoading, onMapBoundsChange, userLocation]);

  // Update markers when properties change
  useEffect(() => {
    if (!map.current || !mapLoaded || !properties.length) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.setMap(null));
    markers.current = [];

    // Add markers for each property that has valid coordinates
    properties.forEach(property => {
      // Skip properties without valid coordinates (0,0 means invalid)
      const [lng, lat] = property.location.coordinates;
      if (!lng || !lat || (lng === 0 && lat === 0)) {
        console.log('🚫 Skipping property without coordinates:', property.title, property.location.coordinates);
        return;
      }

      console.log('📍 Adding marker for:', property.title, 'at', property.location.coordinates);
      
      // Format price for display
      const formatPrice = (price: number, currency: string) => {
        if (currency === 'XOF' || currency === 'XAF') {
          if (price >= 1000000) {
            return `${Math.round(price / 1000000)}M`;
          } else if (price >= 1000) {
            return `${Math.round(price / 1000)}k`;
          }
          return price.toString();
        }
        return `${Math.round(price / 1000)}k`;
      };

      const priceText = formatPrice(property.price, property.currency);
      
      // Create custom marker
      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: map.current,
        title: property.title,
        label: {
          text: priceText,
          color: 'white',
          fontSize: '8px',
          fontWeight: '600'
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#22c55e',
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 1
        }
      });

      // Create info window content
      const infoContent = `
        <div style="width: 280px; border-radius: 12px; overflow: hidden; background: white; cursor: pointer;">
          <div style="position: relative;">
            <img 
              src="${property.images[0]}" 
              alt="${property.title}" 
              style="width: 100%; height: 160px; object-fit: cover; display: block;"
            />
            <div style="
              position: absolute; top: 12px; right: 12px; background: rgba(0, 0, 0, 0.8);
              color: white; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600;
            ">
              ${property.purpose === 'rent' ? 'À louer' : 'À vendre'}
            </div>
          </div>
          
          <div style="padding: 16px;">
            <div style="font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 4px;">
              ${property.price.toLocaleString()} ${property.currency === 'XOF' || property.currency === 'XAF' ? 'CFA' : property.currency}
              ${property.purpose === 'rent' ? '/mois' : ''}
            </div>
            
            <div style="color: #64748b; font-size: 12px; margin-bottom: 8px; font-weight: 500;">
              ${property.purpose === 'rent' ? 'Maison à louer' : 'Maison à vendre'}
            </div>
            
            <div style="
              color: #475569; font-size: 13px; margin-bottom: 12px; line-height: 1.4;
              display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
            ">
              ${property.location.neighborhood}, ${property.location.city}
            </div>
            
            <div style="display: flex; align-items: center; gap: 16px; color: #64748b; font-size: 12px;">
              ${property.bedrooms ? `
                <div style="display: flex; align-items: center; gap: 4px;">
                  🛏️ ${property.bedrooms} chambre${property.bedrooms > 1 ? 's' : ''}
                </div>
              ` : ''}
              ${property.bathrooms ? `
                <div style="display: flex; align-items: center; gap: 4px;">
                  🚿 ${property.bathrooms} sdb
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      `;

      // Add click listener to marker
      marker.addListener('click', () => {
        if (infoWindow.current) {
          infoWindow.current.setContent(infoContent);
          infoWindow.current.open(map.current, marker);
          
          // Call the property select callback
          onPropertySelect(property);
        }
      });

      markers.current.push(marker);
    });

  }, [properties, mapLoaded, onPropertySelect]);

  // Handle selected property change
  useEffect(() => {
    if (!map.current || !selectedProperty) return;

    const [lng, lat] = selectedProperty.location.coordinates;
    if (lng && lat && !(lng === 0 && lat === 0)) {
      // Find the corresponding marker
      const marker = markers.current.find((_, index) => {
        const prop = properties[index];
        return prop && prop.id === selectedProperty.id;
      });

      if (marker && infoWindow.current) {
        // Pan to property and open info window
        map.current.panTo({ lat, lng });
        map.current.setZoom(Math.max(map.current.getZoom() || 10, 14));
        
        // Trigger the marker click to show info window
        google.maps.event.trigger(marker, 'click');
      }
    }
  }, [selectedProperty, properties]);

  if (isLoading) {
    return (
      <div className={`relative h-full w-full bg-muted/50 ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-sm text-muted-foreground">Chargement de la carte...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`relative h-full w-full ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <Card className="p-6 text-center max-w-md">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Layers className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-900 mb-2">Erreur de carte</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>🔍 <strong>Informations de débogage :</strong></p>
                  <ul className="text-left space-y-1">
                    <li>• Clé présente: {googleMapsKey ? '✅' : '❌'}</li>
                    <li>• Format valide: {googleMapsKey?.startsWith('AIza') ? '✅' : '❌'} AIza...</li>
                    <li>• Longueur: {googleMapsKey?.length || 0} caractères</li>
                    <li>• Préfixe: {googleMapsKey?.substring(0, 10) + '...' || 'N/A'}</li>
                  </ul>
                  <p className="mt-3">Si le problème persiste, vérifiez que votre clé Google Maps a les bonnes permissions et qu'elle n'est pas expirée.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-full w-full ${className}`}>
      {/* Search Interface */}
      <div className="absolute top-4 left-4 z-10 w-80">
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une ville ou un quartier..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 bg-background/95 backdrop-blur-sm border-border/50"
            />
          </div>
          
          {showSuggestions && searchSuggestions.length > 0 && (
            <Card className="absolute top-full left-0 right-0 mt-1 p-0 bg-background/95 backdrop-blur-sm border-border/50 max-h-64 overflow-y-auto">
              {searchSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleLocationSelect(suggestion)}
                  className="w-full text-left px-3 py-2 hover:bg-muted/50 border-b border-border/30 last:border-b-0 transition-colors"
                >
                  <div className="font-medium text-sm">{suggestion.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {suggestion.type === 'city' 
                      ? `Ville • ${suggestion.country}`
                      : `Quartier • ${suggestion.city}, ${suggestion.country}`
                    }
                  </div>
                </button>
              ))}
            </Card>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
      
      {/* Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-background/10 rounded-lg" />
    </div>
  );
});

export default PropertyMap;
