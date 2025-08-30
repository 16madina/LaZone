import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyCard, { Property } from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Search, ArrowLeft } from 'lucide-react';
import { useFavoritesContext } from '@/contexts/FavoritesContext';
import { supabase } from '@/integrations/supabase/client';
import { extendedMockProperties } from '@/data/extendedMockProperties';

const Favorites: React.FC = () => {
  const navigate = useNavigate();
  const { favorites, loading: favoritesLoading, isFavorite, toggleFavorite } = useFavoritesContext();
  const [activeTab, setActiveTab] = useState<'rent' | 'sale'>('rent');
  const [favoriteProperties, setFavoriteProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch full property details for favorited listings
  useEffect(() => {
    const fetchFavoriteProperties = async () => {
      if (favoritesLoading || favorites.length === 0) {
        setFavoriteProperties([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const favoriteListingIds = favorites.map(fav => fav.listing_id);

        // Fetch listings from Supabase
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .in('id', favoriteListingIds)
          .eq('status', 'active');

        if (error) throw error;

        // Convert Supabase data to Property format
        const convertedProperties: Property[] = (data || []).map(listing => ({
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
          type: listing.property_type as 'apartment' | 'house' | 'land',
          purpose: listing.purpose as 'rent' | 'sale',
          bedrooms: listing.bedrooms,
          bathrooms: listing.bathrooms,
          area: listing.area,
          landArea: listing.land_area,
          amenities: listing.amenities || [],
          isVerified: false,
          isNew: isNewListing(listing.created_at),
          isFeatured: false,
          agent: {
            name: 'Agent LaZone',
            avatar: '/placeholder.svg',
            isVerified: false
          },
          createdAt: listing.created_at
        }));

        // Add demo properties if some favorites are from demo data
        const demoFavorites = favorites
          .filter(fav => !data?.some(listing => listing.id === fav.listing_id))
          .map(fav => fav.listing_id)
          .map(id => extendedMockProperties.find(prop => prop.id === id))
          .filter(Boolean) as Property[];

        setFavoriteProperties([...convertedProperties, ...demoFavorites]);
      } catch (error) {
        console.error('Error fetching favorite properties:', error);
        
        // Fallback: try to match with demo data
        const demoFavorites = favorites
          .map(fav => extendedMockProperties.find(prop => prop.id === fav.listing_id))
          .filter(Boolean) as Property[];
          
        setFavoriteProperties(demoFavorites);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteProperties();
  }, [favorites, favoritesLoading]);

  const isNewListing = (createdAt: string): boolean => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  };

  const handlePropertyClick = (property: Property) => {
    navigate(`/property/${property.id}`);
  };

  const handleToggleFavorite = async (propertyId: string) => {
    await toggleFavorite(propertyId);
  };

  const filteredProperties = favoriteProperties.filter(p => p.purpose === activeTab);
  const rentCount = favoriteProperties.filter(p => p.purpose === 'rent').length;
  const saleCount = favoriteProperties.filter(p => p.purpose === 'sale').length;

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-64 text-center p-6">
      <Heart className="w-16 h-16 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">Aucun favori</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Vous n'avez pas encore de biens en favoris pour {activeTab === 'rent' ? 'la location' : 'l\'achat'}. 
        Parcourez les annonces et ajoutez celles qui vous intéressent.
      </p>
      <Button onClick={() => navigate('/')} className="flex items-center gap-2">
        <Search className="w-4 h-4" />
        Parcourir les biens
      </Button>
    </div>
  );

  const LoadingState = () => (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (loading || favoritesLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
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
            </div>
          </div>
        </div>
        <LoadingState />
      </div>
    );
  }

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
              {favorites.length}
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'rent' | 'sale')}>
          <TabsList className="w-full grid grid-cols-2 mx-4 mb-4">
            <TabsTrigger value="rent" className="flex items-center gap-2">
              Location
              <Badge variant="secondary" className="ml-1">
                {rentCount}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="sale" className="flex items-center gap-2">
              Achat
              <Badge variant="secondary" className="ml-1">
                {saleCount}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="p-4">
        {filteredProperties.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onFavorite={() => handleToggleFavorite(property.id)}
                isFavorited={isFavorite(property.id)}
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