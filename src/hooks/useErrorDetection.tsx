import { useEffect, useCallback } from 'react';
import { usePerformanceMonitor } from './usePerformanceMonitor';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

interface ErrorInfo {
  message: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  error?: Error;
  stack?: string;
  userAgent?: string;
  url?: string;
  timestamp: number;
}

export const useErrorDetection = () => {
  const { trackError } = usePerformanceMonitor();
  const { toast } = useToast();

  const handleError = useCallback(async (errorInfo: ErrorInfo) => {
    // Log error details
    logger.error('Application error detected', errorInfo.error || new Error(errorInfo.message), {
      component: 'useErrorDetection',
      filename: errorInfo.filename,
      lineno: errorInfo.lineno,
      colno: errorInfo.colno,
      userAgent: errorInfo.userAgent,
      url: errorInfo.url
    });

    // Track error in analytics
    await trackError('javascript_error', errorInfo.message);

    // Show user-friendly notification for critical errors
    if (errorInfo.message.includes('ChunkLoadError') || 
        errorInfo.message.includes('Loading chunk') ||
        errorInfo.message.includes('Network Error')) {
      toast({
        title: 'Erreur de connexion',
        description: 'Veuillez vérifier votre connexion internet et réessayer.',
        variant: 'destructive'
      });
    } else if (errorInfo.message.includes('Permission denied') ||
               errorInfo.message.includes('Unauthorized')) {
      toast({
        title: 'Erreur d\'autorisation',
        description: 'Vous n\'avez pas les permissions nécessaires pour cette action.',
        variant: 'destructive'
      });
    }
  }, [trackError, toast]);

  const detectPerformanceIssues = useCallback(() => {
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.fetchStart;
        const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
        
        // Detect slow page loads
        if (loadTime > 5000) {
          handleError({
            message: `Slow page load detected: ${Math.round(loadTime)}ms`,
            url: window.location.href,
            timestamp: Date.now()
          });
        }
        
        // Detect slow DOM parsing
        if (domContentLoaded > 3000) {
          handleError({
            message: `Slow DOM content loaded: ${Math.round(domContentLoaded)}ms`,
            url: window.location.href,
            timestamp: Date.now()
          });
        }
      }
    }
  }, [handleError]);

  const detectMemoryLeaks = useCallback(() => {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      
      // Check if memory usage is too high
      if (memory.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB
        handleError({
          message: `High memory usage detected: ${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`,
          url: window.location.href,
          timestamp: Date.now()
        });
      }
    }
  }, [handleError]);

  const detectNetworkIssues = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      
      // Detect slow network
      if (connection.downlink < 1) { // Less than 1 Mbps
        handleError({
          message: `Slow network detected: ${connection.downlink} Mbps`,
          url: window.location.href,
          timestamp: Date.now()
        });
      }
      
      // Detect offline state
      if (!navigator.onLine) {
        toast({
          title: 'Connexion interrompue',
          description: 'Vous êtes actuellement hors ligne.',
          variant: 'destructive'
        });
      }
    }
  }, [handleError, toast]);

  useEffect(() => {
    // Global error handler for unhandled JavaScript errors
    const handleGlobalError = (event: ErrorEvent) => {
      handleError({
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: Date.now()
      });
    };

    // Handler for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      handleError({
        message: `Unhandled promise rejection: ${event.reason}`,
        stack: event.reason?.stack,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: Date.now()
      });
    };

    // Resource loading error handler
    const handleResourceError = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target) {
        const tagName = target.tagName?.toLowerCase();
        const src = (target as any).src || (target as any).href;
        
        handleError({
          message: `Resource loading failed: ${tagName} - ${src}`,
          url: window.location.href,
          timestamp: Date.now()
        });
      }
    };

    // Network status change handler
    const handleOnline = () => {
      toast({
        title: 'Connexion rétablie',
        description: 'Vous êtes de nouveau en ligne.',
        variant: 'default'
      });
    };

    const handleOffline = () => {
      toast({
        title: 'Connexion interrompue',
        description: 'Vous êtes actuellement hors ligne.',
        variant: 'destructive'
      });
    };

    // Add event listeners
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleResourceError, true); // Capture phase for resource errors
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set up periodic checks
    const performanceCheckInterval = setInterval(detectPerformanceIssues, 60000); // Every minute
    const memoryCheckInterval = setInterval(detectMemoryLeaks, 300000); // Every 5 minutes
    const networkCheckInterval = setInterval(detectNetworkIssues, 30000); // Every 30 seconds

    // Initial checks
    detectPerformanceIssues();
    detectNetworkIssues();

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleResourceError, true);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      clearInterval(performanceCheckInterval);
      clearInterval(memoryCheckInterval);
      clearInterval(networkCheckInterval);
    };
  }, [handleError, detectPerformanceIssues, detectMemoryLeaks, detectNetworkIssues, toast]);

  // Manual error reporting function
  const reportError = useCallback((error: Error, context?: string) => {
    handleError({
      message: error.message,
      stack: error.stack,
      error,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: Date.now()
    });
  }, [handleError]);

  return {
    reportError,
    detectPerformanceIssues,
    detectMemoryLeaks,
    detectNetworkIssues
  };
};