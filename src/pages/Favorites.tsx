import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyCard, { Property } from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Search, ArrowLeft } from 'lucide-react';
import { comprehensiveMockProperties } from '@/data/comprehensiveSeedData';

// Mock favorites data - remove old static data since we're using comprehensive data now
const Favorites: React.FC = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['1', '10', '25'])); // Sample favorites from comprehensive data
  const [activeTab, setActiveTab] = useState<'rent' | 'sale'>('rent');

  const favoriteProperties = comprehensiveMockProperties.filter(p => 
    favorites.has(p.id) && p.purpose === activeTab
  );

  const toggleFavorite = (propertyId: string) => {
    const newFavorites = new Set(favorites);
    if (favorites.has(propertyId)) {
      newFavorites.delete(propertyId);
    } else {
      newFavorites.add(propertyId);
    }
    setFavorites(newFavorites);
  };

  const handlePropertyClick = (property: Property) => {
    navigate(`/property/${property.id}`);
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-64 text-center p-6">
      <Heart className="w-16 h-16 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">Aucun favori</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Vous n'avez pas encore de biens en favoris. 
        Parcourez les annonces et ajoutez celles qui vous intéressent.
      </p>
      <Button onClick={() => navigate('/')} className="flex items-center gap-2">
        <Search className="w-4 h-4" />
        Parcourir les biens
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              aria-label="Retour"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">Favoris</h1>
            <Badge variant="secondary">
              {favorites.size}
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'rent' | 'sale')}>
          <TabsList className="w-full grid grid-cols-2 mx-4 mb-4">
            <TabsTrigger value="rent" className="flex items-center gap-2">
              Location
              <Badge variant="secondary" className="ml-1">
                {comprehensiveMockProperties.filter(p => favorites.has(p.id) && p.purpose === 'rent').length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="sale" className="flex items-center gap-2">
              Achat
              <Badge variant="secondary" className="ml-1">
                {comprehensiveMockProperties.filter(p => favorites.has(p.id) && p.purpose === 'sale').length}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="py-4">
        {favoriteProperties.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {favoriteProperties.map((property) => (
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

export default Favorites;