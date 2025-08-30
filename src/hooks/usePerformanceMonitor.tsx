import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PerformanceMetric {
  name: string;
  value: number;
  unit?: string;
  url?: string;
}

export const usePerformanceMonitor = () => {
  const { user } = useAuth();

  const trackMetric = useCallback(async (metric: PerformanceMetric) => {
    if (!user) return;

    try {
      await supabase
        .from('performance_metrics')
        .insert({
          metric_name: metric.name,
          metric_value: metric.value,
          metric_unit: metric.unit || 'ms',
          page_url: metric.url || window.location.pathname,
          user_id: user.id
        });
    } catch (error) {
      console.error('Error tracking performance metric:', error);
    }
  }, [user]);

  const trackPageLoad = useCallback(() => {
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        // Track various performance metrics
        trackMetric({
          name: 'page_load_time',
          value: navigation.loadEventEnd - navigation.fetchStart,
          unit: 'ms'
        });

        trackMetric({
          name: 'dom_content_loaded',
          value: navigation.domContentLoadedEventEnd - navigation.fetchStart,
          unit: 'ms'
        });

        trackMetric({
          name: 'first_contentful_paint',
          value: navigation.responseStart - navigation.fetchStart,
          unit: 'ms'
        });
      }
    }
  }, [trackMetric]);

  const trackUserInteraction = useCallback((action: string, element: string) => {
    const startTime = performance.now();
    
    // Return a function to mark the end of the interaction
    return () => {
      const duration = performance.now() - startTime;
      trackMetric({
        name: `interaction_${action}_${element}`,
        value: duration,
        unit: 'ms'
      });
    };
  }, [trackMetric]);

  const trackAPICall = useCallback(async (endpoint: string, method: string, startTime: number) => {
    const duration = performance.now() - startTime;
    
    await trackMetric({
      name: `api_${method.toLowerCase()}_${endpoint.replace(/[\/\?]/g, '_')}`,
      value: duration,
      unit: 'ms'
    });
  }, [trackMetric]);

  const trackError = useCallback(async (errorType: string, errorMessage: string) => {
    await trackMetric({
      name: `error_${errorType}`,
      value: 1,
      unit: 'count'
    });

    // Also track to analytics events for error analysis
    try {
      await supabase
        .from('analytics_events')
        .insert({
          user_id: user?.id,
          event_type: 'error',
          event_data: {
            error_type: errorType,
            error_message: errorMessage,
            url: window.location.pathname
          }
        });
    } catch (error) {
      console.error('Error tracking error event:', error);
    }
  }, [user, trackMetric]);

  // Monitor Core Web Vitals
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Track page load on component mount
      trackPageLoad();

      // Monitor paint timing
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            trackMetric({
              name: 'first_contentful_paint',
              value: entry.startTime,
              unit: 'ms'
            });
          }
        });
      });

      try {
        observer.observe({ entryTypes: ['paint'] });
      } catch (e) {
        // Browser doesn't support Performance Observer
      }

      // Monitor layout shifts
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
      });

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // Browser doesn't support layout shift tracking
      }

      // Track CLS when the page becomes hidden
      const trackCLS = () => {
        trackMetric({
          name: 'cumulative_layout_shift',
          value: clsValue,
          unit: 'score'
        });
      };

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          trackCLS();
        }
      });

      return () => {
        observer.disconnect();
        clsObserver.disconnect();
        document.removeEventListener('visibilitychange', trackCLS);
      };
    }
  }, [trackPageLoad, trackMetric]);

  return {
    trackMetric,
    trackPageLoad,
    trackUserInteraction,
    trackAPICall,
    trackError
  };
};

// Custom hook for tracking component render performance
export const useRenderPerformance = (componentName: string) => {
  const { trackMetric } = usePerformanceMonitor();

  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const renderTime = performance.now() - startTime;
      trackMetric({
        name: `component_render_${componentName}`,
        value: renderTime,
        unit: 'ms'
      });
    };
  }, [componentName, trackMetric]);
};