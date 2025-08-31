import { useEffect } from 'react';
import { useMobileOptimizations } from '@/hooks/useMobileOptimizations';

interface CriticalResource {
  href: string;
  as: 'image' | 'font' | 'style' | 'script';
  type?: string;
  crossorigin?: 'anonymous' | 'use-credentials';
}

const CRITICAL_RESOURCES: CriticalResource[] = [
  {
    href: '/assets/lazone-logo.png',
    as: 'image'
  },
  {
    href: 'https://fonts.gstatic.com/s/poppins/v21/pxiEyp8kv8JHgFVrJJfecg.woff2',
    as: 'font',
    type: 'font/woff2',
    crossorigin: 'anonymous'
  }
];

export const CriticalResourceLoader: React.FC = () => {
  const { shouldPreloadCritical, isOnline } = useMobileOptimizations();

  useEffect(() => {
    if (!shouldPreloadCritical || !isOnline) return;

    const preloadLink = (resource: CriticalResource) => {
      const existing = document.querySelector(`link[href="${resource.href}"]`);
      if (existing) return;

      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      
      if (resource.type) link.type = resource.type;
      if (resource.crossorigin) link.crossOrigin = resource.crossorigin;
      
      // Précharger uniquement si dans le viewport ou interaction imminente
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          document.head.appendChild(link);
        });
      } else {
        setTimeout(() => {
          document.head.appendChild(link);
        }, 100);
      }
    };

    CRITICAL_RESOURCES.forEach(preloadLink);
  }, [shouldPreloadCritical, isOnline]);

  // Préchargement des routes critiques
  useEffect(() => {
    if (!shouldPreloadCritical) return;

    const preloadRoutes = ['/map', '/auth', '/favorites'];
    
    const preloadRoute = (route: string) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      document.head.appendChild(link);
    };

    // Précharger après un délai pour éviter de bloquer le chargement initial
    const timeout = setTimeout(() => {
      preloadRoutes.forEach(preloadRoute);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [shouldPreloadCritical]);

  return null;
};