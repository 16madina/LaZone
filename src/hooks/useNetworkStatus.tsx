import { useState, useEffect, useCallback } from 'react';

interface NetworkState {
  isOnline: boolean;
  wasOffline: boolean;
  connectionType: string | null;
  effectiveType: string | null;
  downlink: number | null;
  rtt: number | null;
}

interface NavigatorConnection {
  type?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  addEventListener?: (event: string, callback: () => void) => void;
  removeEventListener?: (event: string, callback: () => void) => void;
}

declare global {
  interface Navigator {
    connection?: NavigatorConnection;
    mozConnection?: NavigatorConnection;
    webkitConnection?: NavigatorConnection;
  }
}

export const useNetworkStatus = () => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    wasOffline: false,
    connectionType: null,
    effectiveType: null,
    downlink: null,
    rtt: null,
  });

  const getConnectionInfo = useCallback(() => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
      return {
        connectionType: connection.type || null,
        effectiveType: connection.effectiveType || null,
        downlink: connection.downlink || null,
        rtt: connection.rtt || null,
      };
    }
    
    return {
      connectionType: null,
      effectiveType: null,
      downlink: null,
      rtt: null,
    };
  }, []);

  const updateNetworkState = useCallback(() => {
    const connectionInfo = getConnectionInfo();
    const isOnline = navigator.onLine;
    
    setNetworkState(prev => ({
      ...prev,
      isOnline,
      wasOffline: !isOnline ? true : prev.wasOffline,
      ...connectionInfo,
    }));
  }, [getConnectionInfo]);

  const clearWasOffline = useCallback(() => {
    setNetworkState(prev => ({
      ...prev,
      wasOffline: false,
    }));
  }, []);

  useEffect(() => {
    updateNetworkState();

    const handleOnline = () => {
      setNetworkState(prev => ({
        ...prev,
        isOnline: true,
        ...getConnectionInfo(),
      }));
    };

    const handleOffline = () => {
      setNetworkState(prev => ({
        ...prev,
        isOnline: false,
        wasOffline: true,
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection && connection.addEventListener) {
      connection.addEventListener('change', updateNetworkState);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (connection && connection.removeEventListener) {
        connection.removeEventListener('change', updateNetworkState);
      }
    };
  }, [updateNetworkState, getConnectionInfo]);

  const getConnectionQuality = useCallback((): 'excellent' | 'good' | 'fair' | 'poor' | 'offline' => {
    if (!networkState.isOnline) return 'offline';
    
    const { effectiveType, rtt } = networkState;
    
    if (effectiveType === '4g' || (rtt !== null && rtt < 100)) return 'excellent';
    if (effectiveType === '3g' || (rtt !== null && rtt < 300)) return 'good';
    if (effectiveType === '2g' || (rtt !== null && rtt < 600)) return 'fair';
    return 'poor';
  }, [networkState]);

  return {
    ...networkState,
    clearWasOffline,
    getConnectionQuality,
    refresh: updateNetworkState,
  };
};
