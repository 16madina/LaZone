import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  type: 'message' | 'listing' | 'system' | 'favorite';
  title: string;
  description: string;
  isRead: boolean;
  createdAt: string;
  metadata?: {
    listingId?: string;
    conversationId?: string;
    senderId?: string;
    [key: string]: any;
  };
}

interface NotificationSystemReturn {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotifications: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

// In-memory notification store with real-time updates
export const useNotificationSystem = (): NotificationSystemReturn => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate notifications (since we don't have a notifications table yet)
  const generateMockNotifications = useCallback((): Notification[] => {
    if (!user) return [];

    const mockNotifications: Notification[] = [];
    const now = Date.now();

    // Mock some recent activity
    if (Math.random() > 0.5) {
      mockNotifications.push({
        id: `notif-${now}-1`,
        type: 'message',
        title: 'Nouveau message',
        description: 'Vous avez reçu un message concernant une propriété',
        isRead: false,
        createdAt: new Date(now - 5 * 60 * 1000).toISOString(), // 5 minutes ago
        metadata: {
          conversationId: 'conv-123'
        }
      });
    }

    if (Math.random() > 0.7) {
      mockNotifications.push({
        id: `notif-${now}-2`,
        type: 'listing',
        title: 'Nouvelle propriété ajoutée',
        description: 'Une nouvelle propriété correspond à vos critères de recherche',
        isRead: false,
        createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        metadata: {
          listingId: 'listing-456'
        }
      });
    }

    if (Math.random() > 0.8) {
      mockNotifications.push({
        id: `notif-${now}-3`,
        type: 'favorite',
        title: 'Propriété mise à jour',
        description: 'Une de vos propriétés favorites a été mise à jour',
        isRead: true,
        createdAt: new Date(now - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        metadata: {
          listingId: 'listing-789'
        }
      });
    }

    return mockNotifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [user]);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // For now, we'll use mock data
      // In the future, this would be replaced with real database calls
      const mockNotifications = generateMockNotifications();
      
      setNotifications(mockNotifications);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des notifications');
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user, generateMockNotifications]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      // Update local state immediately for better UX
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );

      // In a real implementation, this would update the database
      // await supabase
      //   .from('notifications')
      //   .update({ isRead: true })
      //   .eq('id', notificationId)
      //   .eq('user_id', user?.id);

    } catch (err) {
      console.error('Error marking notification as read:', err);
      // Revert optimistic update on error
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: false }
            : notif
        )
      );
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      // Update local state immediately
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );

      // In a real implementation:
      // await supabase
      //   .from('notifications')
      //   .update({ isRead: true })
      //   .eq('user_id', user?.id)
      //   .eq('isRead', false);

      toast({
        title: 'Notifications marquées comme lues',
        description: 'Toutes vos notifications ont été marquées comme lues'
      });
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de marquer les notifications comme lues',
        variant: 'destructive'
      });
    }
  }, [toast]);

  // Clear all notifications
  const clearNotifications = useCallback(async () => {
    try {
      setNotifications([]);

      // In a real implementation:
      // await supabase
      //   .from('notifications')
      //   .delete()
      //   .eq('user_id', user?.id);

      toast({
        title: 'Notifications supprimées',
        description: 'Toutes vos notifications ont été supprimées'
      });
    } catch (err) {
      console.error('Error clearing notifications:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer les notifications',
        variant: 'destructive'
      });
    }
  }, [toast]);

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!user) return;

    // Subscribe to new messages in conversations where user is involved
    const messagesSubscription = supabase
      .channel('new-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          // Check if this message is for a conversation the user is part of
          // This would require joining with conversations table
          // For now, we'll create a simple notification
          const newMessage = payload.new;
          
          if (newMessage.sender_id !== user.id) {
            const notification: Notification = {
              id: `message-${newMessage.id}`,
              type: 'message',
              title: 'Nouveau message',
              description: 'Vous avez reçu un nouveau message',
              isRead: false,
              createdAt: newMessage.created_at,
              metadata: {
                conversationId: newMessage.conversation_id,
                senderId: newMessage.sender_id
              }
            };

            setNotifications(prev => [notification, ...prev]);

            // Show toast notification
            toast({
              title: 'Nouveau message',
              description: 'Vous avez reçu un nouveau message'
            });
          }
        }
      )
      .subscribe();

    // Subscribe to new listings that might interest the user
    const listingsSubscription = supabase
      .channel('new-listings')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'listings'
        },
        (payload) => {
          const newListing = payload.new;
          
          // Don't notify about user's own listings
          if (newListing.user_id !== user.id) {
            const notification: Notification = {
              id: `listing-${newListing.id}`,
              type: 'listing',
              title: 'Nouvelle propriété',
              description: `Nouvelle propriété disponible: ${newListing.title}`,
              isRead: false,
              createdAt: newListing.created_at,
              metadata: {
                listingId: newListing.id
              }
            };

            setNotifications(prev => [notification, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
      listingsSubscription.unsubscribe();
    };
  }, [user, toast]);

  // Load notifications on mount and when user changes
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Calculate unread count
  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    loading,
    error
  };
};