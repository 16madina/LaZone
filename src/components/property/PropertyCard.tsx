import { useState } from 'react';
import { Heart, Bed, Bath, Maximize, MapPin, Calendar, Star, Clock } from 'lucide-react';
import { Property } from '@/hooks/useProperties';
import { useFavorites } from '@/hooks/useFavorites';
import { Link } from 'react-router-dom';
import { formatPriceWithCurrency } from '@/data/currencies';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { VendorBadge } from '@/components/VendorBadge';

import 'swiper/css';
import 'swiper/css/pagination';

interface PropertyCardProps {
  property: Property;
  index?: number;
  userCountry?: string | null;
  isFirst?: boolean;
}

export const PropertyCard = ({ property, userCountry, isFirst = false }: PropertyCardProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(property.id);
  const [swiperActive, setSwiperActive] = useState(false);

  const formatPrice = () => {
    const countryCode = property.country || userCountry;
    
    // Pour les annonces short_term (Residence), toujours afficher prix par nuit
    if (property.listingType === 'short_term') {
      const nightlyPrice = property.pricePerNight || property.price;
      const formattedPrice = formatPriceWithCurrency(nightlyPrice, countryCode);
      return `${formattedPrice}/nuit`;
    }
    
    // Pour les annonces long_term (LaZone), afficher prix classique
    const formattedPrice = formatPriceWithCurrency(property.price, countryCode);
    if (property.type === 'rent') {
      return `${formattedPrice}/mois`;
    }
    return formattedPrice;
  };

  const hasMultipleImages = property.images.length > 1;

  return (
    <div className="property-card" data-tutorial={isFirst ? "property-card" : undefined}>
      <div className="relative aspect-[4/3] overflow-hidden">
        {hasMultipleImages ? (
          <Swiper
            modules={[Pagination]}
            pagination={{ 
              clickable: true,
              bulletClass: 'swiper-pagination-bullet !w-1.5 !h-1.5 !bg-white/50 !opacity-100',
              bulletActiveClass: '!bg-white !w-2 !h-2',
            }}
            className="w-full h-full property-card-swiper"
            onTouchStart={() => setSwiperActive(true)}
            onTouchEnd={() => setSwiperActive(false)}
          >
            {property.images.map((image, idx) => (
              <SwiperSlide key={idx}>
                <Link to={`/property/${property.id}`}>
                  <img
                    src={image}
                    alt={`${property.title} - ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <Link to={`/property/${property.id}`}>
            <img
              src={property.images[0]}
              alt={property.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </Link>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent pointer-events-none" />
        
        {/* Type Badge - Different for short_term (Residence) listings */}
        <div className="absolute top-2 left-0 z-10">
          {property.listingType === 'short_term' ? (
            <div className="relative">
              {/* Two green bars with rounded right corners */}
              <div className="flex flex-col gap-1">
                <div className="w-3 h-10 bg-emerald-500 rounded-r-lg" />
                <div className="w-3 h-6 bg-emerald-500 rounded-r-lg" />
              </div>
              {/* Clock icon and text positioned to the right of bars */}
              <div className="absolute top-8 left-5 flex items-center gap-1.5 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                <Clock className="w-5 h-5" strokeWidth={2.5} />
                <span className="text-base font-semibold">Courte durée</span>
              </div>
            </div>
          ) : (
            <div className="ml-3 mt-1">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                property.type === 'sale' 
                  ? 'gradient-primary text-primary-foreground' 
                  : 'bg-secondary text-secondary-foreground'
              }`}>
                {property.type === 'sale' ? 'À vendre' : 'À louer'}
              </span>
            </div>
          )}
        </div>
        
        {/* Minimum stay badge for short_term */}
        {property.listingType === 'short_term' && property.minimumStay && property.minimumStay > 1 && (
          <div className="absolute top-20 left-3 z-10">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-background/90 backdrop-blur-sm text-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Min {property.minimumStay} nuits
            </span>
          </div>
        )}

        {/* Property Type Badge */}
        <div className="absolute top-3 right-12 z-10">
          <span className="glass px-3 py-1 rounded-full text-xs font-medium">
            {property.propertyType === 'house' && '🏠 Maison'}
            {property.propertyType === 'apartment' && '🏢 Appartement'}
            {property.propertyType === 'land' && '🌳 Terrain'}
            {property.propertyType === 'commercial' && '🏪 Commercial'}
          </span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(property.id);
          }}
          className="absolute top-3 right-3 z-10 glass w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform"
        >
          <Heart 
            className={`w-4 h-4 transition-colors duration-200 ${
              favorite ? 'fill-destructive text-destructive' : 'text-foreground'
            }`} 
          />
        </button>
      </div>

      <Link to={`/property/${property.id}`}>
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h3 className="font-display font-semibold text-lg leading-tight line-clamp-1">
                {property.title}
              </h3>
              {property.vendorBadge && property.vendorBadge !== 'none' && (
                <VendorBadge level={property.vendorBadge} size="sm" />
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <p className="gradient-text font-display font-bold text-xl">
              {formatPrice()}
            </p>
            {/* Airbnb-style rating for short_term listings */}
            {property.listingType === 'short_term' && (
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                <span className="font-medium">Nouveau</span>
              </div>
            )}
          </div>

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
      </Link>
    </div>
  );
};