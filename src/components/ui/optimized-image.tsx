import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  fallbackSrc?: string;
  quality?: number;
  lazy?: boolean;
  width?: number;
  height?: number;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  loading = 'lazy',
  priority = false,
  fallbackSrc = '/placeholder.svg',
  quality = 80,
  lazy = true,
  width,
  height,
  ...props
}) => {
  // Enhanced source validation
  const validateSrc = (source: string): boolean => {
    if (!source || typeof source !== 'string') return false;
    const trimmed = source.trim();
    if (trimmed === '' || trimmed === 'undefined' || trimmed === 'null') return false;
    return true;
  };

  const validSrc = validateSrc(src) ? src : fallbackSrc;
  const [imageSrc, setImageSrc] = useState(priority || !lazy ? validSrc : fallbackSrc);
  const [isLoading, setIsLoading] = useState(!priority && lazy);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const maxRetries = 2;

  useEffect(() => {
    if (!priority && lazy && imgRef.current && imageSrc === fallbackSrc) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setImageSrc(validSrc);
              setIsLoading(true);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '50px' }
      );

      observer.observe(imgRef.current);

      return () => observer.disconnect();
    }
  }, [validSrc, priority, lazy, imageSrc, fallbackSrc]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    
    if (retryCount < maxRetries && imageSrc !== fallbackSrc) {
      // Retry with a delay
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setImageSrc(validSrc);
        setIsLoading(true);
      }, 1000 * (retryCount + 1));
    } else {
      // Use fallback after max retries
      setHasError(true);
      if (imageSrc !== fallbackSrc) {
        setImageSrc(fallbackSrc);
      }
    }
  };

  // Optimize image URL with quality and size parameters
  const getOptimizedSrc = (originalSrc: string) => {
    // For Unsplash images, add optimization parameters
    if (originalSrc.includes('unsplash.com')) {
      const url = new URL(originalSrc);
      url.searchParams.set('auto', 'format');
      if (quality && quality !== 80) {
        url.searchParams.set('q', quality.toString());
      }
      if (width) url.searchParams.set('w', width.toString());
      if (height) url.searchParams.set('h', height.toString());
      return url.toString();
    }
    return originalSrc;
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <img
        ref={imgRef}
        src={getOptimizedSrc(imageSrc)}
        alt={alt}
        loading={loading}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-all duration-300',
          isLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100',
          hasError && imageSrc === fallbackSrc ? 'filter grayscale' : ''
        )}
        style={{
          objectFit: 'cover',
          ...props.style
        }}
        {...props}
      />
      
      {/* Enhanced loading state */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted/80 animate-pulse flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            {retryCount > 0 && (
              <p className="text-xs text-muted-foreground">Tentative {retryCount + 1}...</p>
            )}
          </div>
        </div>
      )}
      
      {/* Error state */}
      {hasError && imageSrc === fallbackSrc && (
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