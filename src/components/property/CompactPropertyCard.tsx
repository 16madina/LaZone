import { Link } from 'react-router-dom';
import { Bed, Bath, Maximize } from 'lucide-react';
import { Property } from '@/hooks/useProperties';

interface CompactPropertyCardProps {
  property: Property;
}

export const CompactPropertyCard = ({ property }: CompactPropertyCardProps) => {
  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`;
    }
    if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K`;
    }
    return price.toString();
  };

  return (
    <Link 
      to={`/property/${property.id}`}
      className="flex gap-3 p-3 bg-card rounded-xl border border-border hover:shadow-md transition-shadow"
    >
      {/* Image */}
      <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
        <img
          src={property.images[0]}
          alt={property.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <h4 className="font-medium text-sm line-clamp-1">{property.title}</h4>
          <p className="text-xs text-muted-foreground line-clamp-1">{property.city}</p>
        </div>

        {/* Details */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {property.bedrooms > 0 && (
            <span className="flex items-center gap-1">
              <Bed className="w-3.5 h-3.5" />
              {property.bedrooms}
            </span>
          )}
          {property.bathrooms > 0 && (
            <span className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5" />
              {property.bathrooms}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Maximize className="w-3.5 h-3.5" />
            {property.area}m²
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <span className="font-bold text-primary text-sm">
            {formatPrice(property.price)} FCFA
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            property.type === 'sale' 
              ? 'bg-primary/10 text-primary' 
              : 'bg-green-100 text-green-700'
          }`}>
            {property.type === 'sale' ? 'Vente' : 'Location'}
          </span>
        </div>
      </div>
    </Link>
  );
};