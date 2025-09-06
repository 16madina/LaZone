import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UnreadCounts {
  messages: number;
  notifications: number;
  loading: boolean;
}

export const useUnreadCounts = (): UnreadCounts => {
  const { user } = useAuth();
  const [counts, setCounts] = useState<UnreadCounts>({
    messages: 0,
    notifications: 0,
    loading: true
  });

  const fetchUnreadCounts = async () => {
    if (!user) {
      setCounts({ messages: 0, notifications: 0, loading: false });
      return;
    }

    try {
      // Compter les messages non lus
      const { count: messagesCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact' })
        .eq('read', false)
        .neq('sender_id', user.id);

      // Compter les notifications non lues
      const { count: notificationsCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('read', false);

      setCounts({
        messages: messagesCount || 0,
        notifications: notificationsCount || 0,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching unread counts:', error);
      setCounts({ messages: 0, notifications: 0, loading: false });
    }
  };

  useEffect(() => {
    fetchUnreadCounts();

    // Écouter l'événement personnalisé de lecture de messages
    const handleMessagesRead = () => {
      fetchUnreadCounts();
    };
    
    window.addEventListener('messagesRead', handleMessagesRead);

    // Écouter les changements en temps réel
    const messagesSubscription = supabase
      .channel('messages-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages'
      }, () => {
        fetchUnreadCounts();
      })
      .subscribe();

    const notificationsSubscription = supabase
      .channel('notifications-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications'
      }, () => {
        fetchUnreadCounts();
      })
      .subscribe();

    return () => {
      window.removeEventListener('messagesRead', handleMessagesRead);
      messagesSubscription.unsubscribe();
      notificationsSubscription.unsubscribe();
    };
  }, [user]);

  return counts;
};