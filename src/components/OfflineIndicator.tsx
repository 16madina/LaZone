import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export const OfflineIndicator = () => {
  const { isOnline, wasOffline, clearWasOffline } = useNetworkStatus();
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        clearWasOffline();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline, clearWasOffline]);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-destructive text-destructive-foreground px-4 py-3 flex items-center justify-center gap-2 shadow-lg"
        >
          <WifiOff className="w-5 h-5" />
          <span className="font-medium">Vous êtes hors ligne</span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 text-destructive-foreground hover:bg-destructive-foreground/10"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Réessayer
          </Button>
        </motion.div>
      )}
      
      {showReconnected && isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-green-600 text-white px-4 py-3 flex items-center justify-center gap-2 shadow-lg"
        >
          <Wifi className="w-5 h-5" />
          <span className="font-medium">Connexion rétablie</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
