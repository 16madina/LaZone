import { useState, useEffect } from "react";
import Header from "@/components/Header";
import PropertyFilters, { FilterState } from "@/components/PropertyFilters";
import PropertyCard, { Property } from "@/components/PropertyCard";
import PropertyMap from "@/components/PropertyMap";
import WelcomeStats from "@/components/WelcomeStats";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useLocation } from "@/contexts/LocationContext";
import { useFavoritesContext } from "@/contexts/FavoritesContext";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, List, SlidersHorizontal, ArrowUpDown, Search } from "lucide-react";
import { extendedMockProperties } from "@/data/extendedMockProperties";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import AIRecommendations from "@/components/ai/AIRecommendations";
import { getAgentInfo } from "@/utils/agent-utils";

// Use fixed IDs for demo properties so they can be found in PropertyDetail
const generateFixedDemoId = (originalId: string) => {
  return `demo-${originalId}`;
};

const Index = () => {
  const navigate = useNavigate();
  const { selectedCountry } = useLocation();
  const { isFavorite, toggleFavorite } = useFavoritesContext();
  const [searchMode, setSearchMode] = useState<'rent' | 'buy' | 'commercial'>('rent');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [sortBy, setSortBy] = useState('date');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState<FilterState>({
    propertyType: [],
    priceRange: [0, searchMode === 'rent' ? 2000000 : searchMode === 'buy' ? 50000000 : 5000000],
    bedrooms: 'any',
    bathrooms: 'any',
    areaRange: [20, 1000],
    amenities: []
  });

  // Fetch listings from Supabase
  useEffect(() => {
    fetchListings();
  }, [selectedCountry, searchMode]);

  // Update price range when search mode changes
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      priceRange: [0, searchMode === 'rent' ? 2000000 : searchMode === 'buy' ? 50000000 : 5000000]
    }));
  }, [searchMode]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching listings with:', { searchMode, selectedCountry });
      
      let query = supabase
        .from('listings')
        .select('*')
        .eq('status', 'active');
      
      if (searchMode === 'commercial') {
        query = query.eq('property_type', 'commercial');
        console.log('📊 Filtering for commercial properties');
      } else {
        const purpose = searchMode === 'buy' ? 'sale' : searchMode;
        query = query.eq('purpose', purpose);
        console.log('🏠 Filtering for purpose:', purpose);
      }

      // Filtrage strict par pays sélectionné
      if (selectedCountry) {
        query = query.eq('country', selectedCountry);
        console.log('🌍 Filtering for country:', selectedCountry);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;

      console.log('📋 Raw listings from DB:', data?.length || 0, 'items');
      console.log('📋 Sample listing:', data?.[0]);

      // Convert Supabase data to Property format
      const convertedProperties: Property[] = await Promise.all(
        (data || []).map(async listing => {
          const agentInfo = await getAgentInfo(listing.user_id);
          
          return {
            id: listing.id,
            title: listing.title,
            price: listing.price,
            currency: listing.currency,
            location: {
              city: listing.city,
              neighborhood: listing.neighborhood,
              coordinates: [listing.longitude || 0, listing.latitude || 0] as [number, number]
            },
            images: listing.images || ['/placeholder.svg'],
            type: listing.property_type as 'apartment' | 'house' | 'land' | 'commercial',
            purpose: listing.purpose as 'rent' | 'sale' | 'commercial',
            bedrooms: listing.bedrooms,
            bathrooms: listing.bathrooms,
            area: listing.area,
            landArea: listing.land_area,
            amenities: listing.amenities || [],
            isVerified: false,
            isNew: isNewListing(listing.created_at),
            isFeatured: false,
            agent: agentInfo,
            createdAt: listing.created_at
          };
        })
      );

      // Ajouter des propriétés de démonstration seulement si elles correspondent au pays sélectionné
      let finalProperties = convertedProperties;
      
      // Filtrer les propriétés de démonstration selon le pays sélectionné
      if (!selectedCountry || selectedCountry === 'Côte d\'Ivoire') {
        let demoProperties;
        if (searchMode === 'commercial') {
          demoProperties = extendedMockProperties
            .filter(prop => prop.type === 'commercial' && (!selectedCountry || prop.location.city.includes('Abidjan') || prop.location.city.includes('Côte')));
        } else {
          const targetPurpose = searchMode === 'buy' ? 'sale' : 'rent';
          demoProperties = extendedMockProperties
            .filter(prop => prop.purpose === targetPurpose && (!selectedCountry || prop.location.city.includes('Abidjan') || prop.location.city.includes('Côte')));
        }
        
        // Prendre jusqu'à 3 propriétés de démonstration
        demoProperties = demoProperties
          .slice(0, 3)
          .map((prop) => ({
            ...prop,
            // Utiliser un ID fixe pour la démonstration
            id: generateFixedDemoId(prop.id)
          }));
        
        // Les annonces réelles d'abord, puis les propriétés de démonstration
        finalProperties = [...convertedProperties, ...demoProperties];
      }

      setProperties(finalProperties);
      console.log('✅ Final properties set:', finalProperties.length, 'items');
      console.log('✅ First 3 properties:', finalProperties.slice(0, 3).map(p => ({ title: p.title, purpose: p.purpose, city: p.location.city })));
    } catch (error) {
      console.error('Error fetching listings:', error);
      // Fallback to demo data if there's an error
      let demoProperties;
      if (searchMode === 'commercial') {
        demoProperties = extendedMockProperties
          .filter(prop => prop.type === 'commercial');
      } else {
        const targetPurpose = searchMode === 'buy' ? 'sale' : 'rent';
        demoProperties = extendedMockProperties
          .filter(prop => prop.purpose === targetPurpose);
      }
      demoProperties = demoProperties
        .slice(0, 10)
        .map((prop) => ({
          ...prop,
          // Use fixed demo ID so it can be found in PropertyDetail
          id: generateFixedDemoId(prop.id)
        }));
      setProperties(demoProperties);
    } finally {
      setLoading(false);
    }
  };

  const isNewListing = (createdAt: string): boolean => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  };

  // Filter properties based on filters
  const filteredProperties = properties.filter(property => {
    // Type filter
    if (filters.propertyType.length > 0) {
      const typeMap = { 'apartment': 'Appartement', 'house': 'Maison', 'land': 'Terrain', 'commercial': 'Commercial' };
      if (!filters.propertyType.some(type => type === typeMap[property.type as keyof typeof typeMap])) {
        return false;
      }
    }

    // Price filter
    if (property.price < filters.priceRange[0] || property.price > filters.priceRange[1]) {
      return false;
    }

    // Bedrooms filter
    if (filters.bedrooms !== 'any' && property.bedrooms && property.bedrooms < parseInt(filters.bedrooms)) {
      return false;
    }

    // Bathrooms filter  
    if (filters.bathrooms !== 'any' && property.bathrooms && property.bathrooms < parseInt(filters.bathrooms)) {
      return false;
    }

    // Area filter
    if (property.area < filters.areaRange[0] || property.area > filters.areaRange[1]) {
      return false;
    }

    // Amenities filter
    if (filters.amenities.length > 0) {
      if (!filters.amenities.every(amenity => property.amenities.includes(amenity))) {
        return false;
      }
    }

    return true;
  });

  // Apply text search
  const searchedProperties = searchQuery 
    ? filteredProperties.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location.neighborhood.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredProperties;

  // Sort properties
  const sortedProperties = [...searchedProperties].sort((a, b) => {
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

  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <PropertyFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFiltersChange={setFilters}
        searchMode={searchMode}
      />

      <main className="container mx-auto px-4 py-6 pb-24">
        {/* Welcome Stats */}
        <WelcomeStats />
        
        {/* Main Content Tabs */}
        <Tabs defaultValue="properties" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="properties">Propriétés</TabsTrigger>
            <TabsTrigger value="recommendations">Recommandations IA</TabsTrigger>
          </TabsList>
          
          <TabsContent value="properties" className="space-y-6">
            {/* Active Filters & Controls */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">
              {sortedProperties.length} {searchMode === 'rent' ? 'locations' : searchMode === 'buy' ? 'ventes' : 'espaces commerciaux'}
            </span>
            
            {/* Active Filters */}
            {filters.propertyType.length > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <span>Type: {filters.propertyType.join(', ')}</span>
              </Badge>
            )}
            
            {filters.amenities.length > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <span>{filters.amenities.length} commodité(s)</span>
              </Badge>
            )}

            {(filters.bedrooms !== 'any' || filters.bathrooms !== 'any') && (
              <Badge variant="secondary">
                {filters.bedrooms !== 'any' && `${filters.bedrooms}+ ch.`}
                {filters.bedrooms !== 'any' && filters.bathrooms !== 'any' && ', '}
                {filters.bathrooms !== 'any' && `${filters.bathrooms}+ sdb.`}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle Rent/Buy/Commercial */}
            <div className="flex bg-secondary rounded-xl p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  console.log('🔄 Changing search mode from', searchMode, 'to rent');
                  setSearchMode('rent');
                }}
                className={cn(
                  "px-4 py-2 rounded-lg transition-all duration-normal",
                  searchMode === 'rent' 
                    ? "bg-primary text-primary-foreground shadow-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t('nav.rent')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  console.log('🔄 Changing search mode from', searchMode, 'to buy');
                  setSearchMode('buy');
                }}
                className={cn(
                  "px-4 py-2 rounded-lg transition-all duration-normal",
                  searchMode === 'buy' 
                    ? "bg-primary text-primary-foreground shadow-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t('nav.buy')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  console.log('🔄 Changing search mode from', searchMode, 'to commercial');
                  setSearchMode('commercial');
                }}
                className={cn(
                  "px-3 py-2 rounded-lg transition-all duration-normal text-xs",
                  searchMode === 'commercial' 
                    ? "bg-primary text-primary-foreground shadow-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Commercial
              </Button>
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <ArrowUpDown className="w-4 h-4 mr-2" />
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

        {/* Search Bar and Filters - Moved below */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder={t('search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 bg-background/60 backdrop-blur-sm border-border/60 focus:border-primary/60 focus:ring-1 focus:ring-primary/20 rounded-xl"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "px-4 py-3 border-border/60 rounded-xl transition-all duration-normal",
              showFilters && "bg-primary text-primary-foreground border-primary"
            )}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </Button>
        </div>

            {/* Property Cards List */}
            <div className="max-w-full">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : sortedProperties.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center p-8">
                  <SlidersHorizontal className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun résultat trouvé</h3>
                  <p className="text-muted-foreground mb-4">
                    Essayez de modifier vos critères de recherche ou vos filtres.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowFilters(true)}
                  >
                    Modifier les filtres
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 pb-32">
                  {sortedProperties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      onFavorite={() => toggleFavorite(property.id)}
                      isFavorited={isFavorite(property.id)}
                      onClick={handlePropertyClick}
                      onContact={() => {
                        // Handle contact - could open a modal or navigate to contact page
                        console.log('Contact agent for property:', property.id);
                      }}
                      className="w-full"
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="mt-6">
            <AIRecommendations
              userPreferences={{
                budgetRange: filters.priceRange,
                preferredAreas: [selectedCountry],
                propertyTypes: filters.propertyType,
                mustHaveAmenities: filters.amenities
              }}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
