import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface OnlineUser {
  id: string;
  online_at: string;
}

export const useOnlineStatus = () => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<Map<string, OnlineUser>>(new Map());

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = new Map<string, OnlineUser>();
        
        Object.entries(state).forEach(([key, presences]) => {
          if (Array.isArray(presences) && presences.length > 0) {
            const presence = presences[0] as { id?: string; online_at?: string };
            if (presence.id) {
              users.set(key, {
                id: presence.id,
                online_at: presence.online_at || new Date().toISOString(),
              });
            }
          }
        });
        
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        setOnlineUsers(prev => {
          const updated = new Map(prev);
          if (newPresences && newPresences.length > 0) {
            const presence = newPresences[0] as { id?: string; online_at?: string };
            if (presence.id) {
              updated.set(key, {
                id: presence.id,
                online_at: presence.online_at || new Date().toISOString(),
              });
            }
          }
          return updated;
        });
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        setOnlineUsers(prev => {
          const updated = new Map(prev);
          updated.delete(key);
          return updated;
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            id: user.id,
            online_at: new Date().toISOString(),
          });
        }
      });

    // Update presence every 30 seconds to keep connection alive
    const interval = setInterval(async () => {
      await channel.track({
        id: user.id,
        online_at: new Date().toISOString(),
      });
    }, 30000);

    return () => {
      clearInterval(interval);
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [user]);

  const isUserOnline = useCallback((userId: string): boolean => {
    return onlineUsers.has(userId);
  }, [onlineUsers]);

  const getOnlineUsersCount = useCallback((): number => {
    return onlineUsers.size;
  }, [onlineUsers]);

  return {
    onlineUsers,
    isUserOnline,
    getOnlineUsersCount,
  };
};