import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from '@/contexts/LocationContext';
import PropertyMap from '@/components/PropertyMap';
import PropertyCard, { Property } from '@/components/PropertyCard';
import PropertyFilters, { FilterState } from '@/components/PropertyFilters';
import CountrySelector from '@/components/CountrySelector';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { filterProperties } from '@/data/mockProperties';
import { comprehensiveMockProperties, propertiesByCountry } from '@/data/comprehensiveSeedData';
import { AFRICAN_CITIES_DATA, searchCities, searchNeighborhoods } from '@/data/africanCities';
import { SlidersHorizontal, ArrowUpDown, List, Search, ArrowLeft } from 'lucide-react';

const Map: React.FC = () => {
  const navigate = useNavigate();
  const { selectedCountry, coordinates } = useLocation();
  const [searchMode] = useState<'rent' | 'buy'>('rent');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showList, setShowList] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [tokenLoaded, setTokenLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<Array<{type: 'city' | 'neighborhood', name: string, country: string, city?: string}>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Extract and persist Mapbox token
  useEffect(() => {
    const loadToken = () => {
      // Check localStorage first
      const savedToken = localStorage.getItem('mapbox_token');
      if (savedToken) {
        console.log('🗺️ Token Mapbox chargé depuis localStorage:', savedToken.substring(0, 20) + '...');
        setMapboxToken(savedToken);
        setTokenLoaded(true);
        return;
      }

      // Then check URL hash
      const hash = window.location.hash;
      if (hash.includes('mapbox_token=')) {
        const token = hash.split('mapbox_token=')[1].split('&')[0];
        const decodedToken = decodeURIComponent(token);
        console.log('🗺️ Token Mapbox extrait de l\'URL:', token.substring(0, 20) + '...');
        setMapboxToken(decodedToken);
        // Save to localStorage for future use
        localStorage.setItem('mapbox_token', decodedToken);
        // Clean URL
        window.history.replaceState(null, '', window.location.pathname);
        setTokenLoaded(true);
        return;
      }

      // No token found
      setMapboxToken('');
      setTokenLoaded(true);
    };

    loadToken();
  }, []);

  // Debug: Log token changes
  useEffect(() => {
    console.log('🗺️ Mapbox token status:', {
      hasToken: !!mapboxToken,
      tokenLength: mapboxToken?.length,
      tokenPrefix: mapboxToken?.substring(0, 10)
    });
  }, [mapboxToken]);
  
  const [filters, setFilters] = useState<FilterState>({
    propertyType: [],
    priceRange: [0, 2000000],
    bedrooms: 'any',
    bathrooms: 'any',
    areaRange: [20, 1000],
    amenities: []
  });

  // Get properties for the selected country, fallback to all if no country selected
  const countryProperties = selectedCountry && propertiesByCountry[selectedCountry] 
    ? propertiesByCountry[selectedCountry] 
    : comprehensiveMockProperties;

  // Filter and sort properties (map 'buy' to 'sale' for data compatibility)
  const filteredProperties = filterProperties(
    countryProperties.filter(p => p.purpose === (searchMode === 'buy' ? 'sale' : searchMode)),
    filters
  );

  // Sort properties
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    switch (sortBy) {
      case 'price_asc':
        return a.price - b.price;
      case 'price_desc':
        return b.price - a.price;
      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'distance':
        return (a.distance || 0) - (b.distance || 0);
      default:
        return 0;
    }
  });

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
  };

  const handlePropertyClick = (property: Property) => {
    navigate(`/property/${property.id}`);
  };

  const toggleFavorite = (propertyId: string) => {
    const newFavorites = new Set(favorites);
    if (favorites.has(propertyId)) {
      newFavorites.delete(propertyId);
    } else {
      newFavorites.add(propertyId);
    }
    setFavorites(newFavorites);
  };

  // Handle search location navigation
  const navigateToLocation = async (suggestion: {type: 'city' | 'neighborhood', name: string, country: string, city?: string}) => {
    if (!mapboxToken) return;

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
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        const zoom = suggestion.type === 'city' ? 11 : 14;
        
        // Pass coordinates to PropertyMap for navigation
        return { coordinates: [lng, lat] as [number, number], zoom };
      }
    } catch (error) {
      console.error('Error geocoding location:', error);
    }
    return null;
  };

  // Ref to access PropertyMap instance
  const propertyMapRef = useRef<{ navigateToLocation: (coords: [number, number], zoom: number) => void } | null>(null);

  // Handle location navigation from search
  const handleLocationSelect = async (suggestion: {type: 'city' | 'neighborhood', name: string, country: string, city?: string}) => {
    console.log('🎯 Selecting location:', suggestion);
    const result = await navigateToLocation(suggestion);
    console.log('📍 Navigation result:', result);
    
    if (result && propertyMapRef.current) {
      console.log('🗺️ Calling map navigation');
      propertyMapRef.current.navigateToLocation(result.coordinates, result.zoom);
    } else {
      console.log('❌ Navigation failed:', { hasResult: !!result, hasMapRef: !!propertyMapRef.current });
    }
    
    setSearchQuery(suggestion.name);
    setShowSuggestions(false);
  };

  // Handle search input and generate suggestions
  const handleSearchChange = (value: string) => {
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

    // Limit suggestions to 8 for better UX
    setSearchSuggestions(suggestions.slice(0, 8));
    setShowSuggestions(suggestions.length > 0);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex flex-col gap-2 p-3 bg-background border-b border-border z-10">
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Back Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 px-2 py-1 h-8"
            >
              <ArrowLeft className="w-3 h-3" />
              <span className="text-xs">Retour</span>
            </Button>
            
            <CountrySelector variant="compact" />
            <div className="flex items-center gap-1">
              <span className="font-semibold text-sm">Carte</span>
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                {sortedProperties.length} biens
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-24 h-8 text-xs">
                <ArrowUpDown className="w-3 h-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Récent</SelectItem>
                <SelectItem value="price_asc">Prix ↑</SelectItem>
                <SelectItem value="price_desc">Prix ↓</SelectItem>
                <SelectItem value="distance">Distance</SelectItem>
              </SelectContent>
            </Select>

            {/* Filters */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-8 w-8 p-0"
            >
              <SlidersHorizontal className="w-3 h-3" />
            </Button>

            {/* List Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowList(!showList)}
              className="h-8 w-8 p-0"
            >
              <List className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <PropertyFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFiltersChange={setFilters}
        searchMode={searchMode}
      />

      {/* Map Container */}
      <div className="flex-1 relative">
        {tokenLoaded && (
          <PropertyMap
            ref={propertyMapRef}
            properties={sortedProperties}
            selectedProperty={selectedProperty}
            onPropertySelect={handlePropertySelect}
            className="h-full w-full"
            apiKey={mapboxToken || undefined}
            userLocation={coordinates}
          />
        )}

        {/* List Overlay */}
        {showList && (
          <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-background border-t border-border rounded-t-xl overflow-y-auto">
            <div className="sticky top-0 bg-background border-b border-border p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Liste des biens</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowList(false)}
                >
                  ×
                </Button>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              {sortedProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onFavorite={toggleFavorite}
                  isFavorited={favorites.has(property.id)}
                  onClick={handlePropertyClick}
                  onContact={() => {
                    console.log('Contact agent for property:', property.id);
                  }}
                  className="w-full"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Map;