import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface OnlineUser {
  id: string;
  online_at: string;
}

// Notification sound - using a simple base64 encoded notification sound
const NOTIFICATION_SOUND_URL = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleShSp93teleShSp+r4VsXV90n6a1iP//////////';

export const useOnlineStatus = () => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<Map<string, OnlineUser>>(new Map());
  const [lastSeenMap, setLastSeenMap] = useState<Map<string, string>>(new Map());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element for notification sound
  useEffect(() => {
    audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
    audioRef.current.volume = 0.5;
    return () => {
      audioRef.current = null;
    };
  }, []);

  // Fetch last seen times for users
  const fetchLastSeen = useCallback(async (userIds: string[]) => {
    if (userIds.length === 0) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('user_id, last_seen_at')
      .in('user_id', userIds);
    
    if (data) {
      const newMap = new Map(lastSeenMap);
      data.forEach(profile => {
        if (profile.last_seen_at) {
          newMap.set(profile.user_id, profile.last_seen_at);
        }
      });
      setLastSeenMap(newMap);
    }
  }, [lastSeenMap]);

  // Update last seen when going offline
  const updateLastSeen = useCallback(async () => {
    if (!user) return;
    
    await supabase
      .from('profiles')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('user_id', user.id);
  }, [user]);

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
        // Fetch last seen for the user who left
        fetchLastSeen([key]);
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

    // Update last seen when user closes the page
    const handleBeforeUnload = () => {
      updateLastSeen();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      updateLastSeen();
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [user, fetchLastSeen, updateLastSeen]);

  const isUserOnline = useCallback((userId: string): boolean => {
    return onlineUsers.has(userId);
  }, [onlineUsers]);

  const getLastSeen = useCallback((userId: string): string | null => {
    return lastSeenMap.get(userId) || null;
  }, [lastSeenMap]);

  const getOnlineUsersCount = useCallback((): number => {
    return onlineUsers.size;
  }, [onlineUsers]);

  const playNotificationSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Ignore errors if user hasn't interacted with page yet
      });
    }
  }, []);

  return {
    onlineUsers,
    isUserOnline,
    getLastSeen,
    getOnlineUsersCount,
    playNotificationSound,
    fetchLastSeen,
  };
};