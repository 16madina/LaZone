import { useEffect } from 'react';
import { usePushNotifications, isNativePlatform } from '@/hooks/useNativePlugins';
import { useAuth } from '@/hooks/useAuth';

export const PushNotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { register, isNative, isRegistered } = usePushNotifications();

  useEffect(() => {
    // Auto-register for push notifications when user is logged in on native platform
    if (user && isNative && !isRegistered) {
      console.log('Auto-registering for push notifications...');
      register();
    }
  }, [user, isNative, isRegistered, register]);

  return <>{children}</>;
};

export default PushNotificationProvider;
