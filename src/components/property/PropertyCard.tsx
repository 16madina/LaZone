import { Heart, Bed, Bath, Maximize, MapPin } from 'lucide-react';
import { Property } from '@/hooks/useProperties';
import { useFavorites } from '@/hooks/useFavorites';
import { Link } from 'react-router-dom';

interface PropertyCardProps {
  property: Property;
  index?: number;
}

export const PropertyCard = ({ property }: PropertyCardProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(property.id);

  const formatPrice = (price: number, type: 'sale' | 'rent') => {
    if (type === 'rent') {
      return `${price.toLocaleString('fr-CA')} $/mois`;
    }
    return `${price.toLocaleString('fr-CA')} $`;
  };

  return (
    <div className="property-card">
      <Link to={`/property/${property.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
          
          {/* Type Badge */}
          <div className="absolute top-3 left-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              property.type === 'sale' 
                ? 'gradient-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground'
            }`}>
              {property.type === 'sale' ? 'À vendre' : 'À louer'}
            </span>
          </div>

          {/* Property Type Badge */}
          <div className="absolute top-3 right-12">
            <span className="glass px-3 py-1 rounded-full text-xs font-medium">
              {property.propertyType === 'house' && '🏠 Maison'}
              {property.propertyType === 'apartment' && '🏢 Appartement'}
              {property.propertyType === 'land' && '🌳 Terrain'}
              {property.propertyType === 'commercial' && '🏪 Commercial'}
            </span>
          </div>
        </div>
      </Link>

      {/* Favorite Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleFavorite(property.id);
        }}
        className="absolute top-3 right-3 glass w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform"
      >
        <Heart 
          className={`w-4 h-4 transition-colors duration-200 ${
            favorite ? 'fill-destructive text-destructive' : 'text-foreground'
          }`} 
        />
      </button>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-display font-semibold text-lg leading-tight line-clamp-1">
            {property.title}
          </h3>
        </div>

        <p className="gradient-text font-display font-bold text-xl mb-2">
          {formatPrice(property.price, property.type)}
        </p>

        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
          <MapPin className="w-3.5 h-3.5" />
          <span className="line-clamp-1">{property.address}, {property.city}</span>
        </div>

        {property.propertyType !== 'land' && (
          <div className="flex items-center gap-4 text-sm">
            {property.bedrooms > 0 && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Bed className="w-4 h-4" />
                <span>{property.bedrooms}</span>
              </div>
            )}
            {property.bathrooms > 0 && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Bath className="w-4 h-4" />
                <span>{property.bathrooms}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Maximize className="w-4 h-4" />
              <span>{property.area} m²</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};