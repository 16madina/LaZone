import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useImageCache } from '@/hooks/useImageCache';
import { useMobileOptimizations } from '@/hooks/useMobileOptimizations';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  fallbackSrc?: string;
  quality?: number;
  width?: number;
  height?: number;
  placeholder?: 'blur' | 'skeleton' | 'none';
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className,
  priority = false,
  fallbackSrc = '/placeholder.svg',
  quality,
  width,
  height,
  placeholder = 'skeleton',
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [currentSrc, setCurrentSrc] = useState<string | null>(priority ? src : null);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  const { getCachedImage, preloadImage } = useImageCache();
  const { shouldOptimizeImages, maxImageQuality } = useMobileOptimizations();
  
  const maxRetries = 2;

  // Optimize image URL based on device capabilities
  const getOptimizedSrc = useCallback((originalSrc: string): string => {
    if (!originalSrc || originalSrc === fallbackSrc) return originalSrc;
    
    try {
      // For Unsplash and other external services
      if (originalSrc.includes('unsplash.com')) {
        const url = new URL(originalSrc);
        url.searchParams.set('auto', 'format');
        url.searchParams.set('fit', 'crop');
        
        const finalQuality = quality || (shouldOptimizeImages ? maxImageQuality : 85);
        url.searchParams.set('q', finalQuality.toString());
        
        if (width) url.searchParams.set('w', width.toString());
        if (height) url.searchParams.set('h', height.toString());
        
        // Force WebP on supported devices
        if (shouldOptimizeImages) {
          try {
            const canvas = document.createElement('canvas');
            const webpSupported = canvas.toDataURL('image/webp').indexOf('image/webp') !== -1;
            if (webpSupported) {
              url.searchParams.set('fm', 'webp');
            }
          } catch {
            // Ignore WebP detection errors
          }
        }
        
        return url.toString();
      }
      
      // For Supabase storage URLs
      if (originalSrc.includes('supabase.co/storage')) {
        const url = new URL(originalSrc);
        const finalQuality = quality || (shouldOptimizeImages ? maxImageQuality : 85);
        
        if (width) url.searchParams.set('width', width.toString());
        if (height) url.searchParams.set('height', height.toString());
        url.searchParams.set('quality', finalQuality.toString());
        
        return url.toString();
      }
      
      return originalSrc;
    } catch {
      return originalSrc;
    }
  }, [src, quality, shouldOptimizeImages, maxImageQuality, width, height, fallbackSrc]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const currentImgRef = imgRef.current;
    if (!currentImgRef) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    observerRef.current.observe(currentImgRef);

    return () => {
      if (observerRef.current && currentImgRef) {
        observerRef.current.unobserve(currentImgRef);
      }
    };
  }, [priority, isInView]);

  // Load image when in view
  useEffect(() => {
    if (!isInView || currentSrc) return;

    const optimizedSrc = getOptimizedSrc(src);
    
    // Try to get from cache first
    const cachedUrl = getCachedImage(optimizedSrc);
    if (cachedUrl) {
      setCurrentSrc(cachedUrl);
      return;
    }

    // Preload and cache the image
    if (shouldOptimizeImages) {
      preloadImage(optimizedSrc).then(() => {
        const newCachedUrl = getCachedImage(optimizedSrc);
        setCurrentSrc(newCachedUrl || optimizedSrc);
      }).catch(() => {
        setCurrentSrc(optimizedSrc);
      });
    } else {
      setCurrentSrc(optimizedSrc);
    }
  }, [isInView, currentSrc, getOptimizedSrc, getCachedImage, preloadImage, shouldOptimizeImages, src]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsLoaded(false);
    
    if (retryCount < maxRetries && currentSrc !== fallbackSrc) {
      // Retry with exponential backoff
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setCurrentSrc(getOptimizedSrc(src));
        setHasError(false);
      }, Math.pow(2, retryCount) * 1000);
    } else {
      // Use fallback after max retries
      setHasError(true);
      setCurrentSrc(fallbackSrc);
      onError?.();
    }
  }, [retryCount, maxRetries, currentSrc, fallbackSrc, getOptimizedSrc, src, onError]);

  const renderPlaceholder = () => {
    if (placeholder === 'none') return null;
    
    if (placeholder === 'blur') {
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-muted/60 animate-pulse" />
      );
    }
    
    // Skeleton placeholder
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted/80 animate-pulse flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          {retryCount > 0 && (
            <p className="text-xs text-muted-foreground">
              Tentative {retryCount + 1}/{maxRetries + 1}...
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {currentSrc && (
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-all duration-300 ease-out',
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105',
            hasError && currentSrc === fallbackSrc ? 'filter grayscale' : ''
          )}
          style={{
            objectFit: 'cover',
            ...(props.style || {})
          }}
          {...props}
        />
      )}
      
      {/* Placeholder */}
      {!isLoaded && renderPlaceholder()}
      
      {/* Error state */}
      {hasError && currentSrc === fallbackSrc && (
        <div className="absolute inset-0 bg-muted/80 flex items-center justify-center">
          <div className="text-center p-2">
            <div className="w-8 h-8 mx-auto mb-1 rounded bg-muted-foreground/20" />
            <p className="text-xs text-muted-foreground">Image non disponible</p>
          </div>
        </div>
      )}
    </div>
  );
};