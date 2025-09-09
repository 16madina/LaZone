import React, { useEffect, useState } from 'react';
import { Property } from '@/components/PropertyCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Eye, Heart } from 'lucide-react';

// Temporary simple map component for debugging
const PropertyMap: React.FC<{
  properties: Property[];
  favorites: Set<string>;
  onPropertyClick: (property: Property) => void;
  onFavoriteToggle: (propertyId: string) => void;
  center?: [number, number];
  zoom?: number;
}> = ({
  properties,
  favorites,
  onPropertyClick,
  onFavoriteToggle
}) => {
  console.log('🗺️ PropertyMap rendering with properties:', properties.length);
  
  return (
    <div className="h-full w-full relative bg-muted rounded-lg flex items-center justify-center">
      <div className="text-center p-8">
        <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Carte en cours de chargement</h3>
        <p className="text-muted-foreground mb-4">
          {properties.length} propriétés disponibles
        </p>
        <div className="text-sm text-muted-foreground">
          Carte interactive Leaflet temporairement désactivée pour le débogage
        </div>
      </div>
      
      {/* Stats overlay */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
        <div className="text-sm font-medium">
          {properties.length} propriétés détectées
        </div>
      </div>
    </div>
  );
};

export default PropertyMap;