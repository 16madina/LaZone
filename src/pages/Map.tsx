import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyMap from '@/components/PropertyMap';
import PropertyCard, { Property } from '@/components/PropertyCard';
import PropertyFilters, { FilterState } from '@/components/PropertyFilters';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { filterProperties } from '@/data/mockProperties';
import { comprehensiveMockProperties } from '@/data/comprehensiveSeedData';
import { SlidersHorizontal, ArrowUpDown, List } from 'lucide-react';

const Map: React.FC = () => {
  const navigate = useNavigate();
  const [searchMode] = useState<'rent' | 'buy'>('rent');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showList, setShowList] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  const [filters, setFilters] = useState<FilterState>({
    propertyType: [],
    priceRange: [0, 2000000],
    bedrooms: 'any',
    bathrooms: 'any',
    areaRange: [20, 1000],
    amenities: []
  });

  // Filter and sort properties (map 'buy' to 'sale' for data compatibility)
  const filteredProperties = filterProperties(
    comprehensiveMockProperties.filter(p => p.purpose === (searchMode === 'buy' ? 'sale' : searchMode)),
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

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-background border-b border-border z-10">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg">Carte</span>
          <Badge variant="secondary">
            {sortedProperties.length} biens
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <ArrowUpDown className="w-4 h-4 mr-2" />
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
          >
            <SlidersHorizontal className="w-4 h-4" />
          </Button>

          {/* List Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowList(!showList)}
          >
            <List className="w-4 h-4" />
          </Button>
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
        <PropertyMap
          properties={sortedProperties}
          selectedProperty={selectedProperty}
          onPropertySelect={handlePropertySelect}
          className="h-full w-full"
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