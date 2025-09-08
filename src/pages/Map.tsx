import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from '@/contexts/LocationContext';
import PropertyCard, { Property } from '@/components/PropertyCard';
import PropertyFilters, { FilterState } from '@/components/PropertyFilters';
import CountrySelector from '@/components/CountrySelector';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { filterProperties } from '@/data/mockProperties';
import { ArrowLeft, List, SlidersHorizontal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Map: React.FC = () => {
  console.log('🗺️ Map component rendering (list view only)...');
  const navigate = useNavigate();
  const { selectedCountry } = useLocation();
  const { toast } = useToast();
  const [searchMode] = useState<'rent' | 'buy'>('rent');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
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
    console.log('🔄 Loading properties from Supabase...');
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
    
    // Real-time updates
    const channel = supabase
      .channel('map-listings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'listings'
        },
        (payload) => {
          console.log('🗺️ Real-time change detected:', payload);
          loadProperties();
        }
      )
      .subscribe();

    return () => {
      console.log('🧹 Cleanup realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [toast]);

  // Filter properties by selected country and search mode
  const countryFilteredProperties = selectedCountry 
    ? properties.filter(p => {
        const ivorianCities = ['Abidjan', 'Bouaké', 'Daloa', 'Yamoussoukro', 'San-Pédro', 'Korhogo', 'Man', 'Divo', 'Gagnoa', 'Abengourou'];
        if (selectedCountry === 'Côte d\'Ivoire') {
          return ivorianCities.includes(p.location.city);
        }
        return true;
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

  if (isLoadingProperties) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des propriétés...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="flex flex-col gap-2 p-3 bg-background border-b border-border z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
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
              <span className="font-semibold text-sm">Liste des biens</span>
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                {sortedProperties.length} biens
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-8 px-2"
            >
              <SlidersHorizontal className="w-3 h-3 mr-1" />
              <span className="text-xs">Filtres</span>
            </Button>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {sortedProperties.length} propriété{sortedProperties.length > 1 ? 's' : ''} trouvée{sortedProperties.length > 1 ? 's' : ''}
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Plus récent</SelectItem>
              <SelectItem value="price_asc">Prix croissant</SelectItem>
              <SelectItem value="price_desc">Prix décroissant</SelectItem>
              <SelectItem value="distance">Distance</SelectItem>
            </SelectContent>
          </Select>
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

      {/* Properties List */}
      <div className="flex-1 p-4">
        {sortedProperties.length === 0 ? (
          <div className="text-center py-12">
            <List className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune propriété trouvée</h3>
            <p className="text-muted-foreground">
              Essayez de modifier vos critères de recherche ou de filtrage.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
        )}
      </div>
    </div>
  );
};

export default Map;