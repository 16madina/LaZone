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

  // Détecter le type de connexion
  const updateConnectionInfo = useCallback(() => {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    if (connection) {
      const isSlowConnection = connection.effectiveType === 'slow-2g' || 
                               connection.effectiveType === '2g' ||
                               connection.saveData;
      
      setOptimizations(prev => ({
        ...prev,
        connectionType: connection.effectiveType || 'unknown',
        isLowDataMode: connection.saveData || isSlowConnection,
        shouldOptimizeImages: isSlowConnection || connection.saveData,
        maxImageQuality: isSlowConnection ? 60 : 85
      }));
    }
  }, []);

  // Détecter les capacités de l'appareil
  const updateDeviceCapabilities = useCallback(() => {
    const isLowEndDevice = optimizations.hardwareConcurrency <= 2 || 
                          (optimizations.deviceMemory && optimizations.deviceMemory <= 2);
    
    setOptimizations(prev => ({
      ...prev,
      shouldPreloadCritical: !isLowEndDevice && prev.isOnline && !prev.isLowDataMode,
      shouldOptimizeImages: isLowEndDevice || prev.isLowDataMode
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