import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type BadgeLevel = 'none' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface Property {
  id: string;
  title: string;
  price: number;
  type: 'sale' | 'rent';
  propertyType: 'house' | 'apartment' | 'land' | 'commercial';
  address: string;
  city: string;
  country: string | null;
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: string[];
  description: string;
  features: string[];
  lat: number | null;
  lng: number | null;
  createdAt: string;
  userId: string;
  vendorBadge?: BadgeLevel;
}

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch properties with their images
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select(`
          *,
          property_images (
            url,
            is_primary,
            display_order
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (propertiesError) throw propertiesError;

      // Fetch all badges for the property owners
      const userIds = [...new Set((propertiesData || []).map(p => p.user_id))];
      const { data: badgesData } = await supabase
        .from('user_badges')
        .select('user_id, badge_level')
        .in('user_id', userIds);

      const badgeMap = new Map(
        (badgesData || []).map(b => [b.user_id, b.badge_level as BadgeLevel])
      );

      const formattedProperties: Property[] = (propertiesData || []).map((p) => {
        // Sort images: primary first, then by display_order
        const sortedImages = (p.property_images || [])
          .sort((a: any, b: any) => {
            if (a.is_primary && !b.is_primary) return -1;
            if (!a.is_primary && b.is_primary) return 1;
            return (a.display_order || 0) - (b.display_order || 0);
          })
          .map((img: any) => img.url);

        return {
          id: p.id,
          title: p.title,
          price: Number(p.price),
          type: p.type as 'sale' | 'rent',
          propertyType: p.property_type as 'house' | 'apartment' | 'land' | 'commercial',
          address: p.address,
          city: p.city,
          country: p.country || null,
          bedrooms: p.bedrooms || 0,
          bathrooms: p.bathrooms || 0,
          area: Number(p.area),
          images: sortedImages.length > 0 ? sortedImages : ['/placeholder.svg'],
          description: p.description || '',
          features: p.features || [],
          lat: p.lat ? Number(p.lat) : null,
          lng: p.lng ? Number(p.lng) : null,
          createdAt: p.created_at,
          userId: p.user_id,
          vendorBadge: badgeMap.get(p.user_id) || 'none',
        };
      });

      setProperties(formattedProperties);
    } catch (err: any) {
      console.error('Error fetching properties:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { properties, loading, error, refetch: fetchProperties };
};
