import React, { useState, useRef, useCallback } from 'react';

interface ImageOptimizerProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  quality?: number;
  lazy?: boolean;
  fallbackSrc?: string;
}

export const ImageOptimizer: React.FC<ImageOptimizerProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  quality = 85,
  lazy = true,
  fallbackSrc = '/placeholder.svg'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(lazy ? '' : src);
  const imgRef = useRef<HTMLImageElement>(null);

  // Optimisation d'image pour mobile
  const getOptimizedSrc = useCallback((originalSrc: string) => {
    // Si c'est une image Supabase, ajouter les paramètres d'optimisation
    if (originalSrc.includes('supabase.co')) {
      const url = new URL(originalSrc);
      if (width) url.searchParams.set('width', width.toString());
      if (height) url.searchParams.set('height', height.toString());
      url.searchParams.set('quality', quality.toString());
      url.searchParams.set('format', 'webp');
      return url.toString();
    }
    return originalSrc;
  }, [width, height, quality]);

  // Intersection Observer pour le lazy loading
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting && !currentSrc) {
      setCurrentSrc(getOptimizedSrc(src));
    }
  }, [src, currentSrc, getOptimizedSrc]);

  React.useEffect(() => {
    if (!lazy) return;

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.1,
      rootMargin: '50px'
    });

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, handleIntersection]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    setHasError(true);
    setCurrentSrc(fallbackSrc);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder pendant le chargement */}
      {!isLoaded && !hasError && (
        <div 
          className="absolute inset-0 bg-muted animate-pulse"
          style={{ width, height }}
        />
      )}
      
      <img
        ref={imgRef}
        src={currentSrc || (lazy ? '' : getOptimizedSrc(src))}
        alt={alt}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        loading={lazy ? 'lazy' : 'eager'}
        decoding="async"
      />
    </div>
  );
};