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
      // Sponsored properties are filtered by user's country
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

      // Filter by user's country if specified
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
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
        {properties.map((property) => (
          <Link
            key={property.id}
            to={`/property/${property.id}`}
            className="flex-shrink-0 w-[160px] group"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-[0_0_25px_rgba(255,140,0,0.5)] group-hover:scale-[1.02]">
              {/* Glow Background */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/0 via-primary/0 to-primary/0 rounded-2xl opacity-0 group-hover:opacity-100 group-hover:from-primary/30 group-hover:via-primary/50 group-hover:to-primary/30 blur-xl transition-all duration-300 -z-10" />
              
              {/* Image */}
              <div className="aspect-[3/4] relative">
                <img
                  src={property.imageUrl}
                  alt={property.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                
                {/* Sponsor Badge */}
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-primary rounded-full flex items-center gap-1 shadow-md transition-transform duration-300 group-hover:scale-110">
                  <Star className="w-3 h-3 text-white fill-white" />
                  <span className="text-[11px] font-bold text-white">Sponsor</span>
                </div>
              </div>

              {/* Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white font-semibold text-sm truncate">
                  {property.title}
                </p>
                <div className="flex items-center gap-1.5 text-white/80 mt-1">
                  <MapPin className="w-3 h-3" />
                  <span className="text-xs truncate">{property.city}</span>
                </div>
                <p className="text-primary font-bold text-sm mt-1.5">
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