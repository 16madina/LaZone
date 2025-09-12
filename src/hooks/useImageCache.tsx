import { useState, useEffect } from 'react';

interface ImageCacheEntry {
  blob: Blob;
  timestamp: number;
  url: string;
}

interface UseImageCacheReturn {
  getCachedImage: (src: string) => string | null;
  preloadImage: (src: string) => Promise<void>;
  clearCache: () => void;
  cacheSize: number;
}

// Global image cache
const imageCache = new Map<string, ImageCacheEntry>();
const MAX_CACHE_SIZE = 50; // Maximum number of cached images
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export const useImageCache = (): UseImageCacheReturn => {
  const [cacheSize, setCacheSize] = useState(imageCache.size);

  // Clean expired entries
  const cleanExpiredEntries = () => {
    const now = Date.now();
    let hasChanges = false;

    for (const [key, entry] of imageCache.entries()) {
      if (now - entry.timestamp > CACHE_TTL) {
        // Revoke the blob URL to free memory
        URL.revokeObjectURL(entry.url);
        imageCache.delete(key);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      setCacheSize(imageCache.size);
    }
  };

  // Clean cache when it gets too large
  const enforceCacheLimit = () => {
    if (imageCache.size <= MAX_CACHE_SIZE) return;

    // Convert to array and sort by timestamp (oldest first)
    const entries = Array.from(imageCache.entries()).sort(
      ([, a], [, b]) => a.timestamp - b.timestamp
    );

    // Remove oldest entries
    const entriesToRemove = entries.slice(0, imageCache.size - MAX_CACHE_SIZE);
    for (const [key, entry] of entriesToRemove) {
      URL.revokeObjectURL(entry.url);
      imageCache.delete(key);
    }

    setCacheSize(imageCache.size);
  };

  // Get cached image URL
  const getCachedImage = (src: string): string | null => {
    const entry = imageCache.get(src);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      URL.revokeObjectURL(entry.url);
      imageCache.delete(src);
      setCacheSize(imageCache.size);
      return null;
    }

    return entry.url;
  };

  // Preload and cache an image
  const preloadImage = async (src: string): Promise<void> => {
    // Check if already cached
    if (imageCache.has(src)) {
      return;
    }

    try {
      // Fetch the image
      const response = await fetch(src);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }

      // Convert to blob
      const blob = await response.blob();
      
      // Create object URL
      const url = URL.createObjectURL(blob);

      // Store in cache
      imageCache.set(src, {
        blob,
        timestamp: Date.now(),
        url
      });

      setCacheSize(imageCache.size);
      
      // Enforce cache limits
      enforceCacheLimit();
    } catch (error) {
      console.warn('Failed to preload image:', src, error);
    }
  };

  // Clear entire cache
  const clearCache = () => {
    for (const entry of imageCache.values()) {
      URL.revokeObjectURL(entry.url);
    }
    imageCache.clear();
    setCacheSize(0);
  };

  // Clean expired entries on mount and periodically
  useEffect(() => {
    cleanExpiredEntries();
    
    const interval = setInterval(cleanExpiredEntries, 5 * 60 * 1000); // Clean every 5 minutes
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Note: We don't clear the cache on unmount since it's global
      // The cache persists across component instances
    };
  }, []);

  return {
    getCachedImage,
    preloadImage,
    clearCache,
    cacheSize
  };
};