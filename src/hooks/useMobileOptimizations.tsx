import { useState, useEffect, useCallback } from 'react';
import { useCapacitor } from './useCapacitor';

interface MobileOptimizations {
  isOnline: boolean;
  connectionType: string;
  isLowDataMode: boolean;
  deviceMemory?: number;
  hardwareConcurrency: number;
  shouldOptimizeImages: boolean;
  shouldPreloadCritical: boolean;
  maxImageQuality: number;
}

export const useMobileOptimizations = (): MobileOptimizations => {
  const { isNative, platform } = useCapacitor();
  const [optimizations, setOptimizations] = useState<MobileOptimizations>({
    isOnline: navigator.onLine,
    connectionType: 'unknown',
    isLowDataMode: false,
    deviceMemory: (navigator as any).deviceMemory,
    hardwareConcurrency: navigator.hardwareConcurrency || 2,
    shouldOptimizeImages: true,
    shouldPreloadCritical: true,
    maxImageQuality: 85
  });

  // Enhanced connection detection with better heuristics
  const updateConnectionInfo = useCallback(() => {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    if (connection) {
      const isSlowConnection = connection.effectiveType === 'slow-2g' || 
                               connection.effectiveType === '2g' ||
                               connection.downlink < 1.5 ||  // Less than 1.5 Mbps
                               connection.rtt > 300 ||        // High latency
                               connection.saveData;
      
      // Dynamic quality based on connection speed
      let imageQuality = 85;
      if (connection.effectiveType === 'slow-2g') imageQuality = 40;
      else if (connection.effectiveType === '2g') imageQuality = 50;
      else if (connection.effectiveType === '3g') imageQuality = 70;
      else if (connection.saveData) imageQuality = 60;
      
      setOptimizations(prev => ({
        ...prev,
        connectionType: connection.effectiveType || 'unknown',
        isLowDataMode: connection.saveData || isSlowConnection,
        shouldOptimizeImages: isSlowConnection || connection.saveData,
        maxImageQuality: imageQuality
      }));
    } else {
      // Fallback for browsers without Network Information API
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);
      
      setOptimizations(prev => ({
        ...prev,
        shouldOptimizeImages: isMobile,
        maxImageQuality: isMobile ? 70 : 85
      }));
    }
  }, []);

  // Enhanced device capability detection
  const updateDeviceCapabilities = useCallback(() => {
    const deviceMemory = optimizations.deviceMemory || 4; // Default to 4GB if unknown
    const hardwareConcurrency = optimizations.hardwareConcurrency;
    
    // More sophisticated device classification
    const isLowEndDevice = hardwareConcurrency <= 2 || deviceMemory <= 2;
    const isMidRangeDevice = hardwareConcurrency <= 4 && deviceMemory <= 4;
    const isHighEndDevice = hardwareConcurrency > 4 && deviceMemory > 4;
    
    // Battery-aware optimizations for mobile
    const battery = (navigator as any).battery;
    const isLowBattery = battery && battery.level < 0.2 && !battery.charging;
    
    setOptimizations(prev => ({
      ...prev,
      shouldPreloadCritical: isHighEndDevice && prev.isOnline && !prev.isLowDataMode && !isLowBattery,
      shouldOptimizeImages: isLowEndDevice || prev.isLowDataMode || isLowBattery,
      maxImageQuality: prev.maxImageQuality * (isLowEndDevice ? 0.8 : isMidRangeDevice ? 0.9 : 1)
    }));
  }, [optimizations.hardwareConcurrency, optimizations.deviceMemory]);

  useEffect(() => {
    // Écouter les changements de connexion
    const handleOnline = () => setOptimizations(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setOptimizations(prev => ({ ...prev, isOnline: false }));
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Écouter les changements de type de connexion
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateConnectionInfo);
      updateConnectionInfo(); // Initial check
    }

    updateDeviceCapabilities();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', updateConnectionInfo);
      }
    };
  }, [updateConnectionInfo, updateDeviceCapabilities]);

  return optimizations;
};