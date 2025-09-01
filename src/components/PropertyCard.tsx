import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Heart, MapPin, Bed, Bath, Maximize, Phone, MessageCircle, Eye, ChevronLeft, ChevronRight, Building2, UserCheck, User } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useLocation } from "@/contexts/LocationContext";
import { formatPrice } from "@/utils/currency";
import { ImageOptimizer } from "@/components/mobile/ImageOptimizer";
import { useMobileOptimizations } from "@/hooks/useMobileOptimizations";

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
  videoUrl?: string;
  type: 'apartment' | 'house' | 'land' | 'commercial';
  purpose: 'rent' | 'sale' | 'commercial';
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
    type?: 'particulier' | 'agence' | 'démarcheur';
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
  const { maxImageQuality, shouldOptimizeImages } = useMobileOptimizations();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Ensure we always show property details - activate all properties
  const hasImages = property.images && property.images.length > 0;
  const displayImages = hasImages ? property.images : ['/placeholder.svg'];
  const maxVisibleImages = 5;

  // Use current currency from location context, fallback to property currency
  const displayCurrency = currency || property.currency;

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'apartment': return 'Appartement';
      case 'house': return 'Maison';
      case 'land': return 'Terrain';
      case 'commercial': return 'Commercial';
      default: return type;
    }
  };

  const getAgentIcon = (type?: 'particulier' | 'agence' | 'démarcheur') => {
    switch (type) {
      case 'agence': return <Building2 className="w-3 h-3" />;
      case 'démarcheur': return <UserCheck className="w-3 h-3" />;
      default: return <User className="w-3 h-3" />;
    }
  };

  const getAgentLabel = (agent: { type?: 'particulier' | 'agence' | 'démarcheur', name: string }) => {
    switch (agent.type) {
      case 'agence':
        // Pour les agences de démonstration, extraire le nom de l'agence du nom
        if (agent.name === 'Marie Kouassi') return 'Agence JMR';
        if (agent.name === 'Alain Toro') return 'Agence Immo+';
        return 'Agence';
      case 'démarcheur': return 'Démarcheur';
      default: return 'Propriétaire';
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
      {/* Image Container with Carousel */}
      <div className="relative aspect-[16/10] overflow-hidden">
        {displayImages.length > 1 ? (
          <Carousel className="w-full h-full">
            <CarouselContent className="w-full h-full">
              {displayImages.slice(0, maxVisibleImages).map((image, index) => (
                <CarouselItem key={index} className="w-full h-full">
                  <ImageOptimizer
                    src={image}
                    alt={`${property.title} - Image ${index + 1}`}
                    className="w-full h-full object-cover"
                    quality={shouldOptimizeImages ? maxImageQuality : 85}
                    lazy={index > 0}
                    fallbackSrc="/placeholder.svg"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {/* Navigation Arrows */}
            <CarouselPrevious 
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-background/80 backdrop-blur-sm hover:bg-background/90"
            />
            <CarouselNext 
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-background/80 backdrop-blur-sm hover:bg-background/90"
            />
          </Carousel>
        ) : (
          <ImageOptimizer
            src={displayImages[0]}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-slow"
            quality={shouldOptimizeImages ? maxImageQuality : 85}
            lazy={false}
            fallbackSrc="/placeholder.svg"
          />
        )}
        
        {/* Overlay Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1 z-10">
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
            "absolute top-3 right-3 w-8 h-8 p-0 bg-background/80 backdrop-blur-sm hover:bg-background/90 z-10",
            isFavorited && "text-destructive"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onFavorite?.(property.id);
          }}
        >
          <Heart className={cn("w-4 h-4", isFavorited && "fill-current")} />
        </Button>

        {/* Image Count - Always show in top right corner */}
        <div className="absolute top-12 right-3 bg-background/80 backdrop-blur-sm rounded-lg px-2 py-1 text-xs font-medium flex items-center gap-1 z-10">
          <Eye className="w-3 h-3" />
          {displayImages.length}
        </div>

        {/* See More Button - Show when more than 5 images */}
        {hasImages && property.images.length > maxVisibleImages && (
          <Button
            size="sm"
            variant="secondary"
            className="absolute bottom-3 left-3 text-xs bg-background/80 backdrop-blur-sm hover:bg-background/90 z-10"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.(property);
            }}
          >
            Voir plus ({property.images.length - maxVisibleImages}+)
          </Button>
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
              {property.purpose === 'commercial' && <span className="text-sm font-normal text-muted-foreground">/mois</span>}
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
        {property.type !== 'land' && property.type !== 'commercial' && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {property.bedrooms && property.bedrooms > 0 && (
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

        {(property.type === 'land' || property.type === 'commercial') && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {property.type === 'commercial' && property.bathrooms && (
              <div className="flex items-center gap-1">
                <Bath className="w-4 h-4" />
                <span>{property.bathrooms} SdB</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Maximize className="w-4 h-4" />
              <span>{property.area} m²</span>
            </div>
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
            <ImageOptimizer
              src={property.agent.avatar}
              alt={property.agent.name}
              className="w-6 h-6 rounded-full object-cover"
              width={24}
              height={24}
              quality={shouldOptimizeImages ? 60 : 85}
              lazy={true}
              fallbackSrc="/placeholder.svg"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground truncate">
                  {property.agent.name}
                </span>
                {property.agent.isVerified && (
                  <div className="w-1 h-1 bg-success rounded-full flex-shrink-0"></div>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground/80">
                {getAgentIcon(property.agent.type)}
                <span>{getAgentLabel(property.agent)}</span>
              </div>
            </div>
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