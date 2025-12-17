import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { countryCurrencyMap } from '@/data/currencies';

interface SponsoredProperty {
  id: string;
  title: string;
  city: string;
  country: string | null;
  price: number;
  imageUrl: string;
}

interface SponsoredPropertiesSectionProps {
  userCountry?: string | null;
}

export const SponsoredPropertiesSection = ({ userCountry }: SponsoredPropertiesSectionProps) => {
  const [properties, setProperties] = useState<SponsoredProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSponsoredProperties();
  }, [userCountry]);

  const fetchSponsoredProperties = async () => {
    try {
      let query = supabase
        .from('properties')
        .select(`
          id,
          title,
          city,
          country,
          price,
          property_images (url, is_primary)
        `)
        .eq('is_sponsored', true)
        .eq('is_active', true)
        .gte('sponsored_until', new Date().toISOString())
        .order('sponsored_until', { ascending: false })
        .limit(6);

      // Filter by country if specified
      if (userCountry) {
        query = query.eq('country', userCountry);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedProperties: SponsoredProperty[] = (data || []).map(p => ({
        id: p.id,
        title: p.title,
        city: p.city,
        country: p.country,
        price: p.price,
        imageUrl: p.property_images?.find((img: any) => img.is_primary)?.url 
          || p.property_images?.[0]?.url 
          || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
      }));

      setProperties(formattedProperties);
    } catch (error) {
      console.error('Error fetching sponsored properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number, countryCode: string | null) => {
    const currency = countryCode ? countryCurrencyMap[countryCode] : null;
    const symbol = currency?.symbol || 'FCFA';
    
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(0)}M ${symbol}`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K ${symbol}`;
    }
    return `${price.toLocaleString()} ${symbol}`;
  };

  if (loading || properties.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <Star className="w-4 h-4 text-primary fill-primary" />
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">
          Sponsorisé
        </span>
      </div>

      {/* Horizontal Scroll */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {properties.map((property) => (
          <Link
            key={property.id}
            to={`/property/${property.id}`}
            className="flex-shrink-0 w-[140px] group"
          >
            <div className="relative rounded-xl overflow-hidden">
              {/* Image */}
              <div className="aspect-[4/3] relative">
                <img
                  src={property.imageUrl}
                  alt={property.title}
                  className="w-full h-full object-cover group-active:scale-105 transition-transform"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Sponsor Badge */}
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary rounded-full flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 text-white fill-white" />
                  <span className="text-[10px] font-semibold text-white">Sponsor</span>
                </div>
              </div>

              {/* Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <p className="text-white font-medium text-xs truncate">
                  {property.title}
                </p>
                <div className="flex items-center gap-1 text-white/70 mt-0.5">
                  <MapPin className="w-2.5 h-2.5" />
                  <span className="text-[10px] truncate">{property.city}</span>
                </div>
                <p className="text-primary font-bold text-xs mt-1">
                  {formatPrice(property.price, property.country)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SponsoredPropertiesSection;