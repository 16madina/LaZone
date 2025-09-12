import React, { useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface InfiniteScrollProps {
  children: React.ReactNode;
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  threshold?: number;
  className?: string;
  loadingComponent?: React.ReactNode;
  endMessage?: React.ReactNode;
}

export const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  children,
  loading,
  hasMore,
  onLoadMore,
  threshold = 0.1,
  className,
  loadingComponent,
  endMessage
}) => {
  const observerRef = useRef<IntersectionObserver>();
  const loadingRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !loading) {
        onLoadMore();
      }
    },
    [hasMore, loading, onLoadMore]
  );

  useEffect(() => {
    const element = loadingRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(handleObserver, {
      threshold,
      rootMargin: '100px'
    });

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current && element) {
        observerRef.current.unobserve(element);
      }
    };
  }, [handleObserver, threshold]);

  const defaultLoadingComponent = (
    <div className="flex items-center justify-center py-8">
      <div className="flex items-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm text-muted-foreground">Chargement...</span>
      </div>
    </div>
  );

  const defaultEndMessage = (
    <div className="flex items-center justify-center py-8">
      <p className="text-sm text-muted-foreground">Vous avez vu toutes les annonces</p>
    </div>
  );

  return (
    <div className={cn('space-y-4', className)}>
      {children}
      
      {/* Trigger element for intersection observer */}
      <div ref={loadingRef} className="w-full">
        {loading && (loadingComponent || defaultLoadingComponent)}
        {!loading && !hasMore && (endMessage || defaultEndMessage)}
      </div>
    </div>
  );
};