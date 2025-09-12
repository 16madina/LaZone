import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Property } from '@/components/PropertyCard';
import { getAgentInfo } from '@/utils/agent-utils';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

interface UseOptimizedListingsReturn {
  properties: Property[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
  totalCount: number;
}

interface CacheEntry {
  data: Property[];
  timestamp: number;
  params: string;
}

// Global cache with TTL
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const listingsCache = new Map<string, CacheEntry>();

export const useOptimizedListings = (
  searchMode: 'rent' | 'buy' | 'commercial',
  selectedCountry?: string,
  pageSize: number = 20
): UseOptimizedListingsReturn => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [offset, setOffset] = useState(0);
  
  const { trackAPICall, trackError } = usePerformanceMonitor();

  // Cache key for current parameters
  const cacheKey = useMemo(() => 
    `${searchMode}-${selectedCountry || 'all'}-${pageSize}`, 
    [searchMode, selectedCountry, pageSize]
  );

  const isNewListing = (createdAt: string): boolean => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  };

  const fetchListingsBatch = useCallback(async (
    currentOffset: number, 
    isInitial: boolean = false
  ): Promise<Property[]> => {
    const startTime = performance.now();
    
    try {
      // Check cache for initial load only
      if (isInitial) {
        const cached = listingsCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
          return cached.data;
        }
      }

      // Build optimized query with indexes
      let query = supabase
        .from('listings')
        .select(`
          id, title, price, currency, city, neighborhood, 
          longitude, latitude, images, property_type, purpose,
          bedrooms, bathrooms, area, land_area, amenities,
          created_at, user_id
        `, { count: 'estimated' })
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .range(currentOffset, currentOffset + pageSize - 1);

      // Apply filters with indexed columns first for better performance
      if (searchMode === 'commercial') {
        query = query.eq('property_type', 'commercial');
      } else {
        const purpose = searchMode === 'buy' ? 'sale' : searchMode;
        query = query.eq('purpose', purpose);
      }

      if (selectedCountry) {
        query = query.or(`country.eq.${selectedCountry},country.is.null`);
      }

      const { data, error: queryError, count } = await query;

      if (queryError) throw queryError;

      // Batch agent info requests for better performance
      const userIds = [...new Set(data?.map(listing => listing.user_id) || [])];
      const agentInfoPromises = userIds.map(userId => getAgentInfo(userId));
      const agentInfos = await Promise.all(agentInfoPromises);
      
      // Create agent lookup map
      const agentLookup = new Map();
      userIds.forEach((userId, index) => {
        agentLookup.set(userId, agentInfos[index]);
      });

      const convertedProperties: Property[] = (data || []).map(listing => ({
        id: listing.id,
        title: listing.title,
        price: listing.price,
        currency: listing.currency,
        location: {
          city: listing.city,
          neighborhood: listing.neighborhood,
          coordinates: (listing.longitude && listing.latitude) ? 
            [listing.longitude, listing.latitude] as [number, number] :
            [0, 0] as [number, number]
        },
        images: listing.images || ['/placeholder.svg'],
        type: listing.property_type as 'apartment' | 'house' | 'land' | 'commercial',
        purpose: listing.purpose as 'rent' | 'sale' | 'commercial',
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        area: listing.area,
        landArea: listing.land_area,
        amenities: listing.amenities || [],
        isVerified: false,
        isNew: isNewListing(listing.created_at),
        isFeatured: false,
        agent: agentLookup.get(listing.user_id) || {
          name: 'Propriétaire',
          avatar: '/placeholder.svg',
          isVerified: false,
          type: 'particulier' as const,
          agencyName: undefined
        },
        createdAt: listing.created_at
      }));

      // Cache initial results only
      if (isInitial && convertedProperties.length > 0) {
        listingsCache.set(cacheKey, {
          data: convertedProperties,
          timestamp: Date.now(),
          params: cacheKey
        });
        
        // Clean old cache entries
        for (const [key, entry] of listingsCache.entries()) {
          if (Date.now() - entry.timestamp > CACHE_TTL) {
            listingsCache.delete(key);
          }
        }
      }

      if (isInitial && count !== null) {
        setTotalCount(count);
        setHasMore(count > pageSize);
      }

      await trackAPICall('listings', 'GET', startTime);
      return convertedProperties;

    } catch (error) {
      await trackError('listing_fetch', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }, [cacheKey, searchMode, selectedCountry, pageSize, trackAPICall, trackError]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const newProperties = await fetchListingsBatch(offset + pageSize);
      
      if (newProperties.length === 0) {
        setHasMore(false);
      } else {
        setProperties(prev => [...prev, ...newProperties]);
        setOffset(prev => prev + pageSize);
        setHasMore(newProperties.length === pageSize);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading more listings');
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, offset, pageSize, fetchListingsBatch]);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    setOffset(0);
    
    try {
      // Clear cache for this key
      listingsCache.delete(cacheKey);
      
      const initialProperties = await fetchListingsBatch(0, true);
      setProperties(initialProperties);
      setHasMore(initialProperties.length === pageSize);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching listings');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [cacheKey, pageSize, fetchListingsBatch]);

  return {
    properties,
    loading,
    error,
    hasMore,
    loadMore,
    refetch,
    totalCount
  };
};