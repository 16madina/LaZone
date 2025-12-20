import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { usePushNotifications, isNativePlatform } from '@/hooks/useNativePlugins';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export const PushNotificationBanner = () => {
  const { user } = useAuth();
  const { isRegistered, register, isNative } = usePushNotifications();
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if banner was dismissed in this session
  useEffect(() => {
    const wasDismissed = sessionStorage.getItem('push-banner-dismissed');
    if (wasDismissed) {
      setDismissed(true);
    }
  }, []);

  // Don't show if not on native platform, not logged in, already registered, or dismissed
  if (!isNative || !user || isRegistered || dismissed) {
    return null;
  }

  const handleEnable = async () => {
    setLoading(true);
    try {
      await register();
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('push-banner-dismissed', 'true');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground px-4 py-3 shadow-lg"
      >
        <div className="flex items-center justify-between gap-3 max-w-screen-lg mx-auto">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 bg-primary-foreground/20 rounded-full">
              <Bell className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Notifications désactivées</p>
              <p className="text-xs opacity-80 truncate">
                Activez-les pour ne rien manquer
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleEnable}
              disabled={loading}
              className="text-xs h-8"
            >
              {loading ? 'Activation...' : 'Activer'}
            </Button>
            <button
              onClick={handleDismiss}
              className="p-1.5 hover:bg-primary-foreground/20 rounded-full transition-colors"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PushNotificationBanner;
