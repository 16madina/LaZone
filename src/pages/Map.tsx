import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from '@/contexts/LocationContext';
import PropertyMap from '@/components/PropertyMap';
import PropertyCard, { Property } from '@/components/PropertyCard';
import PropertyFilters, { FilterState } from '@/components/PropertyFilters';
import CountrySelector from '@/components/CountrySelector';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { filterProperties } from '@/data/mockProperties';
import { ArrowLeft, Menu } from 'lucide-react';
import { MapSidebar } from '@/components/MapSidebar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Map: React.FC = () => {
  const navigate = useNavigate();
  const { selectedCountry, coordinates } = useLocation();
  const { toast } = useToast();
  const [searchMode] = useState<'rent' | 'buy'>('rent');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showList, setShowList] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showMapSidebar, setShowMapSidebar] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  
  const [filters, setFilters] = useState<FilterState>({
    propertyType: [],
    priceRange: [0, 2000000],
    bedrooms: 'any',
    bathrooms: 'any',
    areaRange: [1, 1000],
    amenities: []
  });

  // Load real properties from Supabase
  useEffect(() => {
    const loadProperties = async () => {
      try {
        setIsLoadingProperties(true);
        
        const { data: listings, error } = await supabase
          .from('listings')
          .select('*')
          .eq('status', 'active')
          .not('latitude', 'is', null)
          .not('longitude', 'is', null);

        if (error) {
          console.error('Error loading properties:', error);
          toast({
            title: "Erreur",
            description: "Impossible de charger les propriétés",
            variant: "destructive",
          });
          return;
        }

        // Transform Supabase data to Property format
        const transformedProperties: Property[] = listings.map(listing => ({
          id: listing.id,
          title: listing.title,
          price: Number(listing.price),
          currency: listing.currency,
          location: {
            city: listing.city,
            neighborhood: listing.neighborhood,
            coordinates: [Number(listing.longitude), Number(listing.latitude)]
          },
          images: listing.images || [],
          videoUrl: listing.video_url,
          type: listing.property_type as 'apartment' | 'house' | 'land' | 'commercial',
          purpose: listing.purpose as 'rent' | 'sale' | 'commercial',
          bedrooms: listing.bedrooms || 0,
          bathrooms: listing.bathrooms || 0,
          area: Number(listing.area),
          landArea: listing.land_area ? Number(listing.land_area) : undefined,
          amenities: listing.amenities || [],
          landDocuments: listing.land_documents || [],
          additionalInfo: listing.additional_info ? String(listing.additional_info) : undefined,
          isVerified: false,
          isNew: new Date(listing.created_at).getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000),
          isFeatured: false,
          agent: {
            name: 'Propriétaire',
            avatar: '/placeholder.svg',
            isVerified: false,
            type: 'particulier'
          },
          createdAt: listing.created_at,
        }));

        console.log('🏠 Loaded properties from Supabase:', transformedProperties.length);
        setProperties(transformedProperties);
        
      } catch (error) {
        console.error('Error loading properties:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les propriétés",
          variant: "destructive",
        });
      } finally {
        setIsLoadingProperties(false);
      }
    };

    loadProperties();
    
    // Configurer les mises à jour en temps réel pour la carte
    const channel = supabase
      .channel('map-listings-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Écouter tous les événements (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'listings'
        },
        (payload) => {
          console.log('🗺️ Changement en temps réel détecté sur la carte:', payload);
          // Recharger les propriétés quand il y a un changement
          loadProperties();
        }
      )
      .subscribe();

    // Nettoyer la subscription au démontage
    return () => {
      console.log('🧹 Nettoyage de la subscription realtime carte');
      supabase.removeChannel(channel);
    };
  }, [toast]);

  // Filter properties by selected country and search mode
  const countryFilteredProperties = selectedCountry 
    ? properties.filter(p => {
        // For simplicity, we'll filter by city since we don't have country in the Property type
        // You can extend this logic based on your country-city mapping
        const ivorianCities = ['Abidjan', 'Bouaké', 'Daloa', 'Yamoussoukro', 'San-Pédro', 'Korhogo', 'Man', 'Divo', 'Gagnoa', 'Abengourou'];
        if (selectedCountry === 'Côte d\'Ivoire') {
          return ivorianCities.includes(p.location.city);
        }
        return true; // For other countries, show all for now
      })
    : properties;

  // Filter by purpose (rent/buy)
  const purposeFilteredProperties = countryFilteredProperties.filter(
    p => p.purpose === (searchMode === 'buy' ? 'sale' : searchMode)
  );

  // Apply additional filters
  const filteredProperties = filterProperties(purposeFilteredProperties, filters);

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

  // Ref to access PropertyMap instance
  const propertyMapRef = useRef<{ navigateToLocation: (coords: [number, number], zoom: number) => void } | null>(null);

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
            {/* Menu Button for Sidebar */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMapSidebar(!showMapSidebar)}
              className="h-8 w-8 p-0"
            >
              <Menu className="w-3 h-3" />
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
        {/* Map Sidebar */}
        <MapSidebar
          isOpen={showMapSidebar}
          onClose={() => setShowMapSidebar(false)}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onShowFilters={() => setShowFilters(!showFilters)}
          onShowList={() => setShowList(!showList)}
        />

        <PropertyMap
          ref={propertyMapRef}
          properties={sortedProperties}
          selectedProperty={selectedProperty}
          onPropertySelect={handlePropertySelect}
          className="h-full w-full"
          userLocation={coordinates}
        />

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