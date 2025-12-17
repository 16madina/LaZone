import { useState, useEffect, useCallback } from 'react';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { Share, ShareResult } from '@capacitor/share';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Check if we're running on a native platform
export const isNativePlatform = () => Capacitor.isNativePlatform();
export const getPlatform = () => Capacitor.getPlatform();

// ==================== CAMERA HOOK ====================
export const useCamera = () => {
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(false);

  const takePicture = useCallback(async () => {
    if (!isNativePlatform()) {
      // Fallback for web - use file input
      return null;
    }

    setLoading(true);
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        saveToGallery: false,
        correctOrientation: true
      });
      setPhoto(image);
      return image;
    } catch (error: any) {
      console.error('Camera error:', error);
      if (error.message !== 'User cancelled photos app') {
        toast({
          title: 'Erreur caméra',
          description: 'Impossible d\'accéder à la caméra',
          variant: 'destructive'
        });
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const pickFromGallery = useCallback(async () => {
    if (!isNativePlatform()) {
      return null;
    }

    setLoading(true);
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
        correctOrientation: true
      });
      setPhoto(image);
      return image;
    } catch (error: any) {
      console.error('Gallery error:', error);
      if (error.message !== 'User cancelled photos app') {
        toast({
          title: 'Erreur galerie',
          description: 'Impossible d\'accéder à la galerie',
          variant: 'destructive'
        });
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const pickMultiple = useCallback(async (limit: number = 10) => {
    if (!isNativePlatform()) {
      return [];
    }

    setLoading(true);
    try {
      const result = await Camera.pickImages({
        quality: 90,
        limit,
        correctOrientation: true
      });
      return result.photos;
    } catch (error: any) {
      console.error('Pick images error:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const checkPermissions = useCallback(async () => {
    if (!isNativePlatform()) return { camera: 'granted', photos: 'granted' };
    
    try {
      const permissions = await Camera.checkPermissions();
      return permissions;
    } catch {
      return { camera: 'denied', photos: 'denied' };
    }
  }, []);

  const requestPermissions = useCallback(async () => {
    if (!isNativePlatform()) return { camera: 'granted', photos: 'granted' };
    
    try {
      const permissions = await Camera.requestPermissions();
      return permissions;
    } catch {
      return { camera: 'denied', photos: 'denied' };
    }
  }, []);

  return {
    photo,
    loading,
    takePicture,
    pickFromGallery,
    pickMultiple,
    checkPermissions,
    requestPermissions,
    isNative: isNativePlatform()
  };
};

// ==================== PUSH NOTIFICATIONS HOOK ====================
export const usePushNotifications = () => {
  const [token, setToken] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Save FCM token to database
  const saveTokenToDatabase = useCallback(async (fcmToken: string) => {
    if (!userId) {
      console.log('No user logged in, cannot save FCM token');
      return;
    }

    const platform = getPlatform() as 'ios' | 'android' | 'web';
    
    try {
      // Check if token already exists
      const { data: existing } = await supabase
        .from('fcm_tokens')
        .select('id')
        .eq('token', fcmToken)
        .maybeSingle();

      if (existing) {
        // Update existing token
        await supabase
          .from('fcm_tokens')
          .update({ 
            user_id: userId,
            platform,
            updated_at: new Date().toISOString()
          })
          .eq('token', fcmToken);
        console.log('FCM token updated in database');
      } else {
        // Insert new token
        await supabase
          .from('fcm_tokens')
          .insert({
            user_id: userId,
            token: fcmToken,
            platform,
            device_info: navigator.userAgent
          });
        console.log('FCM token saved to database');
      }
    } catch (error) {
      console.error('Error saving FCM token:', error);
    }
  }, [userId]);

  // Remove FCM token from database
  const removeTokenFromDatabase = useCallback(async (fcmToken: string) => {
    try {
      await supabase
        .from('fcm_tokens')
        .delete()
        .eq('token', fcmToken);
      console.log('FCM token removed from database');
    } catch (error) {
      console.error('Error removing FCM token:', error);
    }
  }, []);

  const register = useCallback(async () => {
    if (!isNativePlatform()) {
      console.log('Push notifications only available on native platforms');
      return null;
    }

    try {
      // Request permission
      let permStatus = await PushNotifications.checkPermissions();
      
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }
      
      if (permStatus.receive !== 'granted') {
        toast({
          title: 'Notifications désactivées',
          description: 'Activez les notifications dans les paramètres',
          variant: 'destructive'
        });
        return null;
      }

      // Register with APNs/FCM
      await PushNotifications.register();
      setIsRegistered(true);
      return true;
    } catch (error) {
      console.error('Push notification registration error:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!isNativePlatform()) return;

    // Listen for registration token
    const tokenListener = PushNotifications.addListener('registration', async (tokenData: Token) => {
      console.log('Push registration token:', tokenData.value);
      setToken(tokenData.value);
      setIsRegistered(true);
      
      // Save token to database
      await saveTokenToDatabase(tokenData.value);
    });

    // Listen for registration errors
    const errorListener = PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Push registration error:', error);
      setIsRegistered(false);
    });

    // Listen for push notifications received (foreground)
    const notificationListener = PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('Push notification received:', notification);
        toast({
          title: notification.title || 'Notification',
          description: notification.body || ''
        });
      }
    );

    // Listen for push notification actions (user tapped notification)
    const actionListener = PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        console.log('Push notification action:', notification);
        // Handle navigation based on notification data
        const data = notification.notification.data;
        if (data?.route) {
          window.location.href = data.route;
        } else if (data?.type) {
          // Navigate based on notification type
          switch (data.type) {
            case 'message':
              window.location.href = '/messages';
              break;
            case 'follow':
              window.location.href = `/user/${data.actor_id}`;
              break;
            case 'review':
              window.location.href = '/profile';
              break;
            case 'property':
              if (data.property_id) {
                window.location.href = `/property/${data.property_id}`;
              }
              break;
            default:
              window.location.href = '/notifications';
          }
        }
      }
    );

    return () => {
      tokenListener.then(l => l.remove());
      errorListener.then(l => l.remove());
      notificationListener.then(l => l.remove());
      actionListener.then(l => l.remove());
    };
  }, [saveTokenToDatabase]);

  // Re-register when user changes
  useEffect(() => {
    if (userId && isNativePlatform()) {
      register();
    }
  }, [userId, register]);

  const unregister = useCallback(async () => {
    if (!isNativePlatform()) return;
    
    try {
      if (token) {
        await removeTokenFromDatabase(token);
      }
      await PushNotifications.unregister();
      setIsRegistered(false);
      setToken(null);
    } catch (error) {
      console.error('Push unregister error:', error);
    }
  }, [token, removeTokenFromDatabase]);

  return {
    token,
    isRegistered,
    register,
    unregister,
    isNative: isNativePlatform()
  };
};

// ==================== SHARE HOOK ====================
export const useShare = () => {
  const [loading, setLoading] = useState(false);

  const share = useCallback(async (options: {
    title?: string;
    text?: string;
    url?: string;
    dialogTitle?: string;
  }): Promise<ShareResult | null> => {
    setLoading(true);
    try {
      // Check if share is available
      const canShare = await Share.canShare();
      
      if (!canShare.value) {
        // Fallback to clipboard
        if (options.url) {
          await navigator.clipboard.writeText(options.url);
          toast({
            title: 'Lien copié',
            description: 'Le lien a été copié dans le presse-papiers'
          });
        }
        return null;
      }

      const result = await Share.share({
        title: options.title || 'LaZone',
        text: options.text,
        url: options.url,
        dialogTitle: options.dialogTitle || 'Partager'
      });

      return result;
    } catch (error: any) {
      // User cancelled share
      if (error.message?.includes('cancelled') || error.message?.includes('canceled')) {
        return null;
      }
      console.error('Share error:', error);
      toast({
        title: 'Erreur de partage',
        description: 'Impossible de partager le contenu',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const shareProperty = useCallback(async (property: {
    id: string;
    title: string;
    price: number;
    city: string;
  }) => {
    const url = `${window.location.origin}/property/${property.id}`;
    const text = `🏠 ${property.title}\n📍 ${property.city}\n💰 ${property.price.toLocaleString()} - Découvrez sur LaZone!`;
    
    return share({
      title: property.title,
      text,
      url,
      dialogTitle: 'Partager cette propriété'
    });
  }, [share]);

  const shareProfile = useCallback(async (profile: {
    userId: string;
    name: string;
  }) => {
    const url = `${window.location.origin}/user/${profile.userId}`;
    const text = `Découvrez le profil de ${profile.name} sur LaZone!`;
    
    return share({
      title: `Profil de ${profile.name}`,
      text,
      url,
      dialogTitle: 'Partager ce profil'
    });
  }, [share]);

  return {
    share,
    shareProperty,
    shareProfile,
    loading
  };
};

// ==================== STATUS BAR HOOK ====================
export const useStatusBar = () => {
  const setStyle = useCallback(async (style: 'light' | 'dark') => {
    if (!isNativePlatform()) return;
    
    try {
      await StatusBar.setStyle({
        style: style === 'light' ? Style.Light : Style.Dark
      });
    } catch (error) {
      console.error('Status bar error:', error);
    }
  }, []);

  const setBackgroundColor = useCallback(async (color: string) => {
    if (!isNativePlatform()) return;
    
    try {
      await StatusBar.setBackgroundColor({ color });
    } catch (error) {
      console.error('Status bar background error:', error);
    }
  }, []);

  const hide = useCallback(async () => {
    if (!isNativePlatform()) return;
    
    try {
      await StatusBar.hide();
    } catch (error) {
      console.error('Status bar hide error:', error);
    }
  }, []);

  const show = useCallback(async () => {
    if (!isNativePlatform()) return;
    
    try {
      await StatusBar.show();
    } catch (error) {
      console.error('Status bar show error:', error);
    }
  }, []);

  return {
    setStyle,
    setBackgroundColor,
    hide,
    show,
    isNative: isNativePlatform()
  };
};

// ==================== KEYBOARD HOOK ====================
export const useKeyboard = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (!isNativePlatform()) return;

    const showListener = Keyboard.addListener('keyboardWillShow', (info) => {
      setIsVisible(true);
      setKeyboardHeight(info.keyboardHeight);
    });

    const hideListener = Keyboard.addListener('keyboardWillHide', () => {
      setIsVisible(false);
      setKeyboardHeight(0);
    });

    return () => {
      showListener.then(l => l.remove());
      hideListener.then(l => l.remove());
    };
  }, []);

  const hide = useCallback(async () => {
    if (!isNativePlatform()) return;
    
    try {
      await Keyboard.hide();
    } catch (error) {
      console.error('Keyboard hide error:', error);
    }
  }, []);

  return {
    isVisible,
    keyboardHeight,
    hide,
    isNative: isNativePlatform()
  };
};
