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

      // Use mock count for notifications since table doesn't exist
      const mockNotificationsCount = 3;

      setCounts({
        messages: messagesCount || 0,
        notifications: mockNotificationsCount,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching unread counts:', error);
      setCounts({ messages: 0, notifications: 0, loading: false });
    }
  };

  useEffect(() => {
    fetchUnreadCounts();

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

    return () => {
      messagesSubscription.unsubscribe();
    };
  }, [user]);

  return counts;
};