import React, { useEffect, useRef, useState, useImperativeHandle } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
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
  onMapBoundsChange?: (bounds: mapboxgl.LngLatBounds) => void;
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
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<Array<{type: 'city' | 'neighborhood', name: string, country: string, city?: string}>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch Mapbox token from Supabase Edge Function
  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        // Use provided apiKey if available
        if (apiKey) {
          setMapboxToken(apiKey);
          setIsLoading(false);
          return;
        }

        // Otherwise, fetch from Supabase Edge Function
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error) throw error;
        
        if (data?.mapboxToken) {
          setMapboxToken(data.mapboxToken);
        } else {
          setError('Token Mapbox non disponible');
        }
      } catch (err) {
        logger.error('Error fetching Mapbox token', err as Error, { component: 'PropertyMap' });
        setError('Erreur lors du chargement de la carte');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMapboxToken();
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
    if (!map.current || !mapboxToken) {
      logger.warn('Map or token not ready for navigation', { component: 'PropertyMap' });
      return;
    }

    logger.debug('Navigating to location', { component: 'PropertyMap', location: suggestion });
    setSearchQuery(suggestion.name);
    setShowSuggestions(false);

    try {
      // Use Mapbox Geocoding API to get coordinates
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          suggestion.type === 'city' 
            ? `${suggestion.name}, ${suggestion.country}` 
            : `${suggestion.name}, ${suggestion.city}, ${suggestion.country}`
        )}.json?access_token=${mapboxToken}&country=CI,SN,GH,NG,KE,TZ,UG,ET,EG,MA,DZ,TN,LY,SD,ML,BF,NE,TD,CF,CM,GQ,GA,CG,CD,AO,ZM,ZW,BW,NA,ZA,SZ,LS,MW,MZ,MG,MU,SC,KM,DJ,SO,ER,SS,RW,BI,GM,GW,SL,LR,GN,CV`
      );
      
      const data = await response.json();
      logger.debug('Geocoding response received', { component: 'PropertyMap', featuresCount: data.features?.length });
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        const zoom = suggestion.type === 'city' ? 11 : 14;
        
        logger.debug('Flying to coordinates', { 
          component: 'PropertyMap', 
          coordinates: [lng, lat], 
          zoom 
        });
        
        map.current.flyTo({
          center: [lng, lat],
          zoom: zoom,
          duration: 2000
        });
        
        logger.debug('Navigation completed', { component: 'PropertyMap' });
      } else {
        logger.warn('No geocoding results found', { component: 'PropertyMap', suggestion });
      }
    } catch (error) {
      logger.error('Error geocoding location', error as Error, { 
        component: 'PropertyMap', 
        suggestion 
      });
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapboxToken || isLoading) return;

    // Wait a bit for the container to be ready
    const initMap = () => {
      if (!mapContainer.current) {
        logger.debug('Map container not ready, retrying', { component: 'PropertyMap' });
        setTimeout(initMap, 100);
        return;
      }

      logger.debug('Initializing map', { component: 'PropertyMap' });

      // Clean up existing map
      if (map.current) {
        map.current.remove();
        map.current = null;
      }

      // Set Mapbox access token
      mapboxgl.accessToken = mapboxToken;
      
      try {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/light-v11',
          center: [17.7, 7.2], // Centre de l'Afrique (République centrafricaine/Tchad)
          zoom: 3, // Vue d'ensemble de l'Afrique
          pitch: 0,
          // Limiter la navigation aux coordonnées africaines
          maxBounds: [
            [-25, -40], // Sud-ouest de l'Afrique (Atlantic + Sud)
            [55, 38]    // Nord-est de l'Afrique (Mer Rouge + Méditerranée)
          ],
          minZoom: 2, // Zoom minimum pour garder l'Afrique visible
          maxZoom: 18 // Zoom maximum pour les détails urbains
        });

        map.current.addControl(
          new mapboxgl.NavigationControl({
            visualizePitch: false,
          }),
          'top-right'
        );

        map.current.on('load', () => {
          logger.info('Map loaded successfully', { component: 'PropertyMap' });
          setMapLoaded(true);
          
          // Center map on user location if available (only if in Africa)
          if (userLocation && map.current) {
            const [lng, lat] = userLocation;
            // Vérifier si la localisation est en Afrique
            if (lng >= -25 && lng <= 55 && lat >= -40 && lat <= 38) {
              map.current.flyTo({
                center: userLocation,
                zoom: 12,
                duration: 2000
              });
            } else {
              // Si hors d'Afrique, garder le centre par défaut
              logger.info('User location outside Africa, keeping default center', { 
                component: 'PropertyMap',
                userLocation 
              });
            }
          }
        });

        map.current.on('error', (e) => {
          logger.error('Map error', new Error(e.error?.message || 'Unknown map error'), { component: 'PropertyMap' });
          setError('Erreur lors du chargement de la carte');
        });

        // Listen for map movements
        map.current.on('moveend', () => {
          if (map.current && onMapBoundsChange) {
            onMapBoundsChange(map.current.getBounds());
          }
        });

      } catch (error) {
        logger.error('Error initializing map', error as Error, { component: 'PropertyMap' });
        setError('Erreur lors de l\'initialisation de la carte');
      }
    };

    initMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken, isLoading, onMapBoundsChange, userLocation]);

  // Update markers when properties change
  useEffect(() => {
    if (!map.current || !mapLoaded || !properties.length) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
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
      
      // Create custom marker with price
      const el = document.createElement('div');
      el.className = 'property-marker';
      
      // Format price for display - très compact
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
      
      el.style.cssText = `
        background: #22c55e;
        color: white;
        border: 1px solid white;
        border-radius: 12px;
        padding: 2px 4px;
        font-size: 8px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        transition: all 0.2s ease;
        white-space: nowrap;
        position: relative;
        min-width: 20px;
        max-width: 35px;
        text-align: center;
        height: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        transform-origin: center;
      `;
      
      el.textContent = priceText;
      
      // Hover effect
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.15)';
        el.style.zIndex = '1000';
        el.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.4)';
      });
      
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
        el.style.zIndex = '1';
        el.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.3)';
      });

      // Create marker with offset to prevent overflow
      const marker = new mapboxgl.Marker(el, {
        offset: [0, -7] // Offset to prevent markers from going outside map bounds
      })
        .setLngLat(property.location.coordinates)
        .addTo(map.current!);

      // Create popup content with property preview
      const popupContent = document.createElement('div');
      popupContent.className = 'property-popup';
      popupContent.style.cssText = `
        width: 280px;
        border-radius: 12px;
        overflow: hidden;
        background: white;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        cursor: pointer;
        transition: transform 0.2s ease;
      `;
      
      popupContent.innerHTML = `
        <div style="position: relative;">
          <img 
            src="${property.images[0]}" 
            alt="${property.title}" 
            style="
              width: 100%;
              height: 160px;
              object-fit: cover;
              display: block;
            "
          />
          <div style="
            position: absolute;
            top: 12px;
            right: 12px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
          ">
            ${property.purpose === 'rent' ? 'À louer' : 'À vendre'}
          </div>
        </div>
        
        <div style="padding: 16px;">
          <div style="
            font-size: 18px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 4px;
          ">
            ${property.price.toLocaleString()} ${property.currency === 'XOF' || property.currency === 'XAF' ? 'CFA' : property.currency}
            ${property.purpose === 'rent' ? '/mois' : ''}
          </div>
          
          <div style="
            color: #64748b;
            font-size: 12px;
            margin-bottom: 8px;
            font-weight: 500;
          ">
            ${property.purpose === 'rent' ? 'Maison à louer' : 'Maison à vendre'}
          </div>
          
          <div style="
            color: #475569;
            font-size: 13px;
            margin-bottom: 12px;
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            ">
              ${property.location.neighborhood}, ${property.location.city}
            </div>
          
          <div style="
            display: flex;
            align-items: center;
            gap: 16px;
            color: #64748b;
            font-size: 12px;
          ">
            ${property.bedrooms ? `
              <div style="display: flex; align-items: center; gap: 4px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 9.557V3h-2v2H6V3H4v6.557C2.81 10.25 2 11.525 2 13v4a1 1 0 0 0 1 1h1v4h2v-4h12v4h2v-4h1a1 1 0 0 0 1-1v-4c0-1.475-.81-2.75-2-3.443zM18 7v2.129c-.47-.08-.94-.129-1-.129-.66 0-1.26.22-1.78.46L15 7h3zM8 7h2l-.22 2.46c-.52-.24-1.12-.46-1.78-.46-.06 0-.53.049-1 .129V7z"/>
                </svg>
                ${property.bedrooms}
              </div>
            ` : ''}
            ${property.bathrooms ? `
              <div style="display: flex; align-items: center; gap: 4px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                ${property.bathrooms}
              </div>
            ` : ''}
            <div style="display: flex; align-items: center; gap: 4px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              ${property.area} m²
            </div>
          </div>
        </div>
      `;

      // Add hover effect to popup
      popupContent.addEventListener('mouseenter', () => {
        popupContent.style.transform = 'translateY(-2px)';
        popupContent.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.2)';
      });
      
      popupContent.addEventListener('mouseleave', () => {
        popupContent.style.transform = 'translateY(0)';
        popupContent.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
      });

      // Add click handler to navigate to property detail
      popupContent.addEventListener('click', (e) => {
        e.stopPropagation();
        // Navigate to property detail page
        window.location.href = `/property/${property.id}`;
      });

      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        anchor: 'bottom',
        maxWidth: 'none'
      }).setDOMContent(popupContent);

      marker.setPopup(popup);

      // Click event - show popup
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onPropertySelect(property);
        
        // Open the popup immediately
        popup.addTo(map.current!);
        
        map.current?.flyTo({
          center: property.location.coordinates,
          zoom: 14,
          duration: 1000
        });
      });

      markers.current.push(marker);
    });

    // Fit map to markers if we have properties with padding to keep markers visible
    if (properties.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      properties.forEach(property => {
        bounds.extend(property.location.coordinates);
      });
      
      // Add extra padding to ensure markers don't go outside visible area
      map.current.fitBounds(bounds, {
        padding: { top: 80, bottom: 80, left: 60, right: 60 }, // Increased padding
        maxZoom: 12 // Reduced max zoom to show more area
      });
    }
  }, [properties, mapLoaded, onPropertySelect]);

  // Add method to navigate to location
  const navigateToLocationOnMap = (coordinates: [number, number], zoom: number) => {
    logger.debug('Navigating to coordinates', { 
      component: 'PropertyMap', 
      coordinates, 
      zoom 
    });
    
    if (map.current) {
      map.current.flyTo({
        center: coordinates,
        zoom: zoom,
        duration: 1500
      });
      logger.debug('Navigation command sent to map', { component: 'PropertyMap' });
    } else {
      logger.warn('Map not ready for navigation', { component: 'PropertyMap' });
    }
  };

  // Expose navigation method via ref
  useImperativeHandle(ref, () => ({
    navigateToLocation: navigateToLocationOnMap
  }), []);

  logger.debug('PropertyMap render', { component: 'PropertyMap', refAvailable: !!ref });

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This function is no longer needed but kept for compatibility
  };

  if (isLoading) {
    return (
      <div className={`relative bg-card border border-border rounded-xl p-8 ${className}`}>
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">Chargement de la carte</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Préparation de la carte interactive...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`relative bg-card border border-border rounded-xl p-8 ${className}`}>
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <Layers className="w-8 h-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">Erreur de carte</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!mapboxToken) {
    return (
      <div className={`relative bg-card border border-border rounded-xl p-8 ${className}`}>
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Layers className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">Configuration Mapbox</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Pour afficher la carte interactive avec les biens immobiliers, connectez votre token Mapbox public.
            </p>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-xs text-muted-foreground mb-2">📍 Étapes simples :</p>
            <ol className="text-xs text-muted-foreground space-y-1 text-left">
              <li>1. Créez un compte gratuit sur <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">mapbox.com</a></li>
              <li>2. Copiez votre "Public token" depuis le dashboard</li>
              <li>3. Collez-le ci-dessous</li>
            </ol>
          </div>

          <form onSubmit={handleApiKeySubmit} className="space-y-4 max-w-sm mx-auto">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Configuration en cours...</p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full rounded-xl overflow-hidden" />
      
      {/* Search Bar - positioned at the top center */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-20">
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher une ville ou un quartier..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => {
                logger.debug('Search focused', { 
                  component: 'PropertyMap', 
                  suggestionsCount: searchSuggestions.length 
                });
                if (searchSuggestions.length > 0) setShowSuggestions(true);
              }}
              className="pl-8 pr-3 py-2 h-8 text-xs bg-background/95 backdrop-blur-sm border-border/50 focus:border-primary"
            />
          </div>
          
          {/* Search Suggestions */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <Card className="absolute top-full mt-1 w-full bg-background/95 backdrop-blur-sm border-border/50 shadow-lg z-50">
              <div className="max-h-64 overflow-y-auto">
                {searchSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-3 hover:bg-muted/50 cursor-pointer border-b border-border/30 last:border-b-0 transition-colors"
                    onClick={() => {
                      logger.debug('Suggestion clicked', { 
                        component: 'PropertyMap', 
                        suggestion 
                      });
                      handleLocationSelect(suggestion);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${suggestion.type === 'city' ? 'bg-primary' : 'bg-secondary'}`} />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{suggestion.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {suggestion.type === 'city' ? (
                            `Ville • ${suggestion.country}`
                          ) : (
                            `Quartier • ${suggestion.city}, ${suggestion.country}`
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
      
      {/* Map Controls */}
      <div className="absolute top-3 left-3 flex flex-col gap-1">
        <Button
          size="sm"
          variant="secondary"
          className="bg-background/90 backdrop-blur-sm h-8 w-20 text-xs"
          onClick={() => {
            if (map.current && properties.length > 0) {
              const bounds = new mapboxgl.LngLatBounds();
              properties.forEach(property => {
                bounds.extend(property.location.coordinates);
              });
              map.current.fitBounds(bounds, { 
                padding: { top: 80, bottom: 80, left: 60, right: 60 }, 
                maxZoom: 12 
              });
            }
          }}
        >
          <Maximize2 className="w-3 h-3 mr-1" />
          Tout voir
        </Button>
      </div>

      {/* Search in area button */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
        <Button 
          className="bg-primary text-primary-foreground shadow-primary h-8 text-xs px-3"
          onClick={() => {
            if (map.current && onMapBoundsChange) {
              onMapBoundsChange(map.current.getBounds());
            }
          }}
        >
          Rechercher dans cette zone
        </Button>
      </div>
    </div>
  );
});

export default PropertyMap;