import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Property } from '@/components/PropertyCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Eye, Heart } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon
const createCustomIcon = (isFavorited: boolean) => {
  return L.divIcon({
    html: `
      <div class="relative">
        <div class="w-8 h-8 bg-primary rounded-full border-2 border-white shadow-lg flex items-center justify-center">
          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
          </svg>
        </div>
        ${isFavorited ? '<div class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white"></div>' : ''}
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

interface PropertyMapProps {
  properties: Property[];
  favorites: Set<string>;
  onPropertyClick: (property: Property) => void;
  onFavoriteToggle: (propertyId: string) => void;
  center?: [number, number];
  zoom?: number;
}

// Component to fit map bounds to markers
const FitBounds: React.FC<{ properties: Property[] }> = ({ properties }) => {
  const map = useMap();

  useEffect(() => {
    if (properties.length > 0) {
      const validProperties = properties.filter(p => 
        p.location.coordinates && 
        p.location.coordinates.length === 2 &&
        !isNaN(p.location.coordinates[1]) && 
        !isNaN(p.location.coordinates[0])
      );

      if (validProperties.length > 0) {
        const bounds = L.latLngBounds(
          validProperties.map(p => [p.location.coordinates[1], p.location.coordinates[0]])
        );
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [properties, map]);

  return null;
};

const PropertyMap: React.FC<PropertyMapProps> = ({
  properties,
  favorites,
  onPropertyClick,
  onFavoriteToggle,
  center = [7.539989, -5.54708], // Abidjan par défaut
  zoom = 10
}) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>(center);

  // Filter properties with valid coordinates
  const validProperties = properties.filter(property => 
    property.location.coordinates && 
    property.location.coordinates.length === 2 &&
    !isNaN(property.location.coordinates[1]) && 
    !isNaN(property.location.coordinates[0])
  );

  console.log('🗺️ PropertyMap rendering with properties:', properties.length, 'valid:', validProperties.length);

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        className="h-full w-full rounded-lg"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <FitBounds properties={validProperties} />
        
        {validProperties.map((property) => {
          const [lng, lat] = property.location.coordinates;
          const isFavorited = favorites.has(property.id);
          
          return (
            <Marker
              key={property.id}
              position={[lat, lng]}
              icon={createCustomIcon(isFavorited)}
            >
              <Popup className="custom-popup" maxWidth={300}>
                <div className="p-2 min-w-[280px]">
                  {/* Image */}
                  {property.images && property.images.length > 0 && (
                    <div className="mb-3 rounded-lg overflow-hidden">
                      <img 
                        src={property.images[0]} 
                        alt={property.title}
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-sm leading-tight pr-2">
                        {property.title}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          onFavoriteToggle(property.id);
                        }}
                      >
                        <Heart 
                          className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} 
                        />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{property.location.neighborhood || property.location.city}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
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
                      
                      <div className="flex gap-1">
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
                      className="w-full mt-3" 
                      size="sm"
                      onClick={() => onPropertyClick(property)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Voir détails
                    </Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Stats overlay */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg z-[1000]">
        <div className="text-sm font-medium">
          {validProperties.length} propriétés sur la carte
        </div>
      </div>
    </div>
  );
};

export default PropertyMap;