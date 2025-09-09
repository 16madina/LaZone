import React from 'react';
import { Property } from '@/components/PropertyCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Eye, Heart } from 'lucide-react';

interface PropertyMapProps {
  properties: Property[];
  favorites: Set<string>;
  onPropertyClick: (property: Property) => void;
  onFavoriteToggle: (propertyId: string) => void;
  center?: [number, number];
  zoom?: number;
}

const PropertyMap: React.FC<PropertyMapProps> = ({
  properties,
  favorites,
  onPropertyClick,
  onFavoriteToggle
}) => {
  console.log('🗺️ PropertyMap rendering with properties:', properties.length);
  
  // Filter properties with valid coordinates
  const validProperties = properties.filter(property => 
    property.location.coordinates && 
    property.location.coordinates.length === 2 &&
    !isNaN(property.location.coordinates[1]) && 
    !isNaN(property.location.coordinates[0])
  );

  return (
    <div className="h-full w-full relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      {/* Map placeholder with property cards */}
      <div className="h-full w-full overflow-y-auto p-4">
        <div className="text-center mb-6 py-8">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Vue Carte</h3>
          <p className="text-muted-foreground mb-4">
            {validProperties.length} propriétés avec coordonnées trouvées
          </p>
        </div>

        {/* Property grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {validProperties.map((property) => {
            const isFavorited = favorites.has(property.id);
            
            return (
              <div
                key={property.id}
                className="bg-card rounded-lg border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Image */}
                {property.images && property.images.length > 0 && (
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={property.images[0]} 
                      alt={property.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm hover:bg-white/90"
                      onClick={(e) => {
                        e.stopPropagation();
                        onFavoriteToggle(property.id);
                      }}
                    >
                      <Heart 
                        className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} 
                      />
                    </Button>
                  </div>
                )}
                
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm leading-tight">
                      {property.title}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                    <MapPin className="w-3 h-3" />
                    <span>{property.location.neighborhood || property.location.city}</span>
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                      📍 {property.location.coordinates[1].toFixed(3)}, {property.location.coordinates[0].toFixed(3)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-lg font-bold text-primary">
                        {property.price.toLocaleString()} {property.currency}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {property.bedrooms ? `${property.bedrooms} ch` : ''} 
                        {property.bedrooms && property.area ? ' • ' : ''}
                        {property.area ? `${property.area}m²` : ''}
                      </div>
                    </div>
                    
                    <div className="flex gap-1 flex-col">
                      {property.isNew && (
                        <Badge variant="secondary" className="text-xs px-2 py-0.5">
                          Nouveau
                        </Badge>
                      )}
                      <Badge 
                        variant="outline" 
                        className="text-xs px-2 py-0.5 capitalize"
                      >
                        {property.purpose === 'sale' ? 'Vente' : 'Location'}
                      </Badge>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    size="sm"
                    onClick={() => onPropertyClick(property)}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Voir détails
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {validProperties.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune propriété avec coordonnées</h3>
            <p className="text-muted-foreground">
              Les propriétés sans coordonnées GPS ne peuvent pas être affichées sur la carte.
            </p>
          </div>
        )}
      </div>
      
      {/* Stats overlay */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg">
        <div className="text-sm font-medium">
          {validProperties.length} propriétés avec localisation
        </div>
        <div className="text-xs text-muted-foreground">
          Mode carte simplifiée
        </div>
      </div>
    </div>
  );
};

export default PropertyMap;