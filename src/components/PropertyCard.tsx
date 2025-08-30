import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, MapPin, Bed, Bath, Maximize, Phone, MessageCircle, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "@/contexts/LocationContext";
import { formatPrice } from "@/utils/currency";

export interface Property {
  id: string;
  title: string;
  price: number;
  currency: string;
  location: {
    city: string;
    neighborhood: string;
    coordinates: [number, number];
  };
  images: string[];
  type: 'apartment' | 'house' | 'land';
  purpose: 'rent' | 'sale';
  bedrooms?: number;
  bathrooms?: number;
  area: number;
  landArea?: number;
  amenities: string[];
  isVerified: boolean;
  isNew: boolean;
  isFeatured: boolean;
  agent: {
    name: string;
    avatar: string;
    isVerified: boolean;
  };
  createdAt: string;
  distance?: number;
}

interface PropertyCardProps {
  property: Property;
  onFavorite?: (id: string) => void;
  isFavorited?: boolean;
  onContact?: (property: Property) => void;
  onClick?: (property: Property) => void;
  className?: string;
}

export default function PropertyCard({ 
  property, 
  onFavorite, 
  isFavorited = false, 
  onContact,
  onClick,
  className 
}: PropertyCardProps) {
  const { currency } = useLocation();

  // Use current currency from location context, fallback to property currency
  const displayCurrency = currency || property.currency;

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'apartment': return 'Appartement';
      case 'house': return 'Maison';
      case 'land': return 'Terrain';
      default: return type;
    }
  };

  return (
    <Card 
      className={cn(
        "group overflow-hidden bg-gradient-card hover:shadow-lg transition-all duration-normal cursor-pointer",
        className
      )}
      onClick={() => onClick?.(property)}
    >
      {/* Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={property.images && property.images.length > 0 && property.images[0] ? property.images[0] : '/placeholder.svg'}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-slow"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
        
        {/* Overlay Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
          {property.isNew && (
            <Badge className="bg-success text-success-foreground">
              Nouveau
            </Badge>
          )}
          {property.isFeatured && (
            <Badge className="bg-warning text-warning-foreground">
              Exclusivité
            </Badge>
          )}
          {property.isVerified && (
            <Badge variant="secondary" className="bg-background/80 text-foreground">
              Vérifié
            </Badge>
          )}
        </div>

        {/* Favorite Button */}
        <Button
          size="sm"
          variant="ghost"
          className={cn(
            "absolute top-3 right-3 w-8 h-8 p-0 bg-background/80 backdrop-blur-sm hover:bg-background/90",
            isFavorited && "text-destructive"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onFavorite?.(property.id);
          }}
        >
          <Heart className={cn("w-4 h-4", isFavorited && "fill-current")} />
        </Button>

        {/* Image Count */}
        {property.images && property.images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-background/80 backdrop-blur-sm rounded-lg px-2 py-1 text-xs font-medium flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {property.images.length}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Price and Type */}
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xl font-bold text-primary">
              {formatPrice(property.price, displayCurrency)}
              {property.purpose === 'rent' && <span className="text-sm font-normal text-muted-foreground">/mois</span>}
            </div>
            <div className="text-sm text-muted-foreground">
              {getTypeLabel(property.type)}
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors duration-normal">
          {property.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">
            {property.location.neighborhood}, {property.location.city}
          </span>
          {property.distance && (
            <span className="text-xs">• {property.distance.toFixed(1)} km</span>
          )}
        </div>

        {/* Details */}
        {property.type !== 'land' && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {property.bedrooms && (
              <div className="flex items-center gap-1">
                <Bed className="w-4 h-4" />
                <span>{property.bedrooms}</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center gap-1">
                <Bath className="w-4 h-4" />
                <span>{property.bathrooms}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Maximize className="w-4 h-4" />
              <span>{property.area} m²</span>
            </div>
          </div>
        )}

        {property.type === 'land' && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Maximize className="w-4 h-4" />
            <span>{property.area} m²</span>
          </div>
        )}

        {/* Amenities */}
        {property.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {property.amenities.slice(0, 3).map((amenity) => (
              <Badge key={amenity} variant="outline" className="text-xs">
                {amenity}
              </Badge>
            ))}
            {property.amenities.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{property.amenities.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Agent and Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            <img
              src={property.agent.avatar}
              alt={property.agent.name}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="text-xs text-muted-foreground truncate">
              {property.agent.name}
            </span>
            {property.agent.isVerified && (
              <div className="w-1 h-1 bg-success rounded-full flex-shrink-0"></div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onContact?.(property);
              }}
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                // Handle phone call
              }}
            >
              <Phone className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}