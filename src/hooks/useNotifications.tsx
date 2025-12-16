import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Notification {
  id: string;
  user_id: string;
  type: 'follow' | 'review' | 'message';
  actor_id: string;
  entity_id: string | null;
  is_read: boolean;
  created_at: string;
  actor?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

// Request browser notification permission
const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

// Show browser notification
const showBrowserNotification = (title: string, body: string, icon?: string) => {
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon: icon || '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'lazone-notification'
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Auto close after 5 seconds
    setTimeout(() => notification.close(), 5000);
  }
};

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Request permission on mount
  useEffect(() => {
    requestNotificationPermission().then(setPermissionGranted);
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Fetch actor profiles
      const actorIds = [...new Set((data || []).map(n => n.actor_id))];
      
      if (actorIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', actorIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

        const notificationsWithActors: Notification[] = (data || []).map(n => ({
          ...n,
          type: n.type as 'follow' | 'review' | 'message',
          actor: profileMap.get(n.actor_id) || undefined
        }));

        setNotifications(notificationsWithActors);
        setUnreadCount(notificationsWithActors.filter(n => !n.is_read).length);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Subscribe to new notifications in realtime
      const channel = supabase
        .channel('notifications-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          async (payload) => {
            console.log('New notification received:', payload);
            const newNotification = payload.new as Notification;
            
            // Fetch actor profile for the new notification
            const { data: actorProfile } = await supabase
              .from('profiles')
              .select('user_id, full_name, avatar_url')
              .eq('user_id', newNotification.actor_id)
              .maybeSingle();

            const enrichedNotification: Notification = {
              ...newNotification,
              type: newNotification.type as 'follow' | 'review' | 'message',
              actor: actorProfile || undefined
            };

            // Update state immediately
            setNotifications(prev => [enrichedNotification, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Show browser notification if permission granted
            if (permissionGranted) {
              const actorName = actorProfile?.full_name || 'Quelqu\'un';
              let title = 'LaZone';
              let body = 'Nouvelle notification';

              switch (newNotification.type) {
                case 'follow':
                  title = 'Nouveau follower';
                  body = `${actorName} a commencé à vous suivre`;
                  break;
                case 'review':
                  title = 'Nouvel avis';
                  body = `${actorName} vous a laissé un avis`;
                  break;
                case 'message':
                  title = 'Nouveau message';
                  body = `${actorName} vous a envoyé un message`;
                  break;
              }

              showBrowserNotification(title, body, actorProfile?.avatar_url || undefined);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const updated = payload.new as Notification;
            setNotifications(prev => 
              prev.map(n => n.id === updated.id ? { ...n, ...updated } : n)
            );
            // Recalculate unread count
            setNotifications(prev => {
              setUnreadCount(prev.filter(n => !n.is_read).length);
              return prev;
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, fetchNotifications, permissionGranted]);

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const requestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermissionGranted(granted);
    return granted;
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
    permissionGranted,
    requestPermission
  };
};