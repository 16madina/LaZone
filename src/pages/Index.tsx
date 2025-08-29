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
import { filterProperties } from '@/data/mockProperties';
import { comprehensiveMockProperties } from '@/data/comprehensiveSeedData';
import { useNavigate } from "react-router-dom";
import { MapPin, List, SlidersHorizontal, ArrowUpDown } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [searchMode, setSearchMode] = useState<'rent' | 'buy'>('rent');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [sortBy, setSortBy] = useState('date');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  const [filters, setFilters] = useState<FilterState>({
    propertyType: [],
    priceRange: [0, searchMode === 'rent' ? 2000000 : 50000000],
    bedrooms: 'any',
    bathrooms: 'any',
    areaRange: [20, 1000],
    amenities: []
  });

  // Update price range when search mode changes
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      priceRange: [0, searchMode === 'rent' ? 2000000 : 50000000]
    }));
  }, [searchMode]);

  // Filter and sort properties (map 'buy' to 'sale' for data compatibility)
  const filteredProperties = filterProperties(
    comprehensiveMockProperties.filter(p => p.purpose === (searchMode === 'buy' ? 'sale' : searchMode)),
    filters
  );

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

  const toggleFavorite = (propertyId: string) => {
    const newFavorites = new Set(favorites);
    if (favorites.has(propertyId)) {
      newFavorites.delete(propertyId);
    } else {
      newFavorites.add(propertyId);
    }
    setFavorites(newFavorites);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        searchMode={searchMode}
        onSearchModeChange={setSearchMode}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onFiltersToggle={() => setShowFilters(!showFilters)}
        showFilters={showFilters}
      />

      <PropertyFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFiltersChange={setFilters}
        searchMode={searchMode}
      />

      <main className="container mx-auto px-4 py-6">
        {/* Welcome Stats */}
        <WelcomeStats />
        
        {/* Active Filters & Controls */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">
              {sortedProperties.length} {searchMode === 'rent' ? 'locations' : 'ventes'}
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

            {/* View Toggle - Mobile Only */}
            <div className="flex bg-secondary rounded-lg p-1 lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('map')}
                className={viewMode === 'map' ? "bg-primary text-primary-foreground" : ""}
              >
                <MapPin className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? "bg-primary text-primary-foreground" : ""}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-280px)]">
          {/* Map Section - Hidden on mobile when list is active */}
          <div className={`${viewMode === 'list' ? 'hidden lg:block' : ''}`}>
            <PropertyMap
              properties={sortedProperties}
              selectedProperty={selectedProperty}
              onPropertySelect={handlePropertySelect}
              apiKey={window.location.hash.includes('mapbox_token=') 
                ? window.location.hash.split('mapbox_token=')[1].split('&')[0] 
                : undefined
              }
              className="h-full rounded-xl"
            />
          </div>

          {/* List Section - Hidden on mobile when map is active */}
          <div className={`${viewMode === 'map' ? 'hidden lg:block' : ''} overflow-y-auto`}>
            {sortedProperties.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
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
              <div className="space-y-4 pr-2">
                {sortedProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onFavorite={toggleFavorite}
                    isFavorited={favorites.has(property.id)}
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
        </div>
      </main>
    </div>
  );
};

export default Index;
