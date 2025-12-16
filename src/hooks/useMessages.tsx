import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  property_id: string | null;
  is_read: boolean | null;
  created_at: string;
}

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  propertyId?: string;
  propertyTitle?: string;
}

export const useMessages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUnread, setTotalUnread] = useState(0);

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch all messages where user is sender or receiver
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group messages by conversation (other participant)
      const conversationMap = new Map<string, Message[]>();
      
      messages?.forEach(msg => {
        const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        const existing = conversationMap.get(otherUserId) || [];
        existing.push(msg);
        conversationMap.set(otherUserId, existing);
      });

      // Get unique participant IDs
      const participantIds = Array.from(conversationMap.keys());

      if (participantIds.length === 0) {
        setConversations([]);
        setTotalUnread(0);
        setLoading(false);
        return;
      }

      // Fetch participant profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', participantIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Fetch property titles for messages with property_id
      const propertyIds = [...new Set(messages?.filter(m => m.property_id).map(m => m.property_id))];
      let propertyMap = new Map();
      
      if (propertyIds.length > 0) {
        const { data: properties } = await supabase
          .from('properties')
          .select('id, title')
          .in('id', propertyIds);
        propertyMap = new Map(properties?.map(p => [p.id, p.title]) || []);
      }

      // Build conversations list
      const convList: Conversation[] = [];
      let totalUnreadCount = 0;

      conversationMap.forEach((msgs, participantId) => {
        const profile = profileMap.get(participantId);
        const lastMsg = msgs[0];
        const unreadCount = msgs.filter(m => m.receiver_id === user.id && !m.is_read).length;
        totalUnreadCount += unreadCount;

        convList.push({
          id: participantId,
          participantId,
          participantName: profile?.full_name || 'Utilisateur',
          participantAvatar: profile?.avatar_url || null,
          lastMessage: lastMsg.content,
          lastMessageTime: lastMsg.created_at,
          unreadCount,
          propertyId: lastMsg.property_id || undefined,
          propertyTitle: lastMsg.property_id ? propertyMap.get(lastMsg.property_id) : undefined
        });
      });

      // Sort by last message time
      convList.sort((a, b) => 
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      );

      setConversations(convList);
      setTotalUnread(totalUnreadCount);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchConversations();

      // Subscribe to realtime updates
      const channel = supabase
        .channel('messages-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${user.id}`
          },
          (payload) => {
            console.log('New message received:', payload);
            fetchConversations();
            
            // Show toast for new messages
            if (payload.eventType === 'INSERT') {
              toast({
                title: 'Nouveau message',
                description: 'Vous avez reçu un nouveau message',
              });
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `sender_id=eq.${user.id}`
          },
          () => {
            fetchConversations();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, fetchConversations]);

  return {
    conversations,
    loading,
    totalUnread,
    refetch: fetchConversations
  };
};

export const useConversation = (participantId: string | null) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!user || !participantId) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${participantId}),and(sender_id.eq.${participantId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('receiver_id', user.id)
        .eq('sender_id', participantId)
        .eq('is_read', false);

    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [user, participantId]);

  useEffect(() => {
    if (user && participantId) {
      fetchMessages();

      // Subscribe to realtime updates
      const channel = supabase
        .channel(`conversation-${participantId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages'
          },
          (payload) => {
            const newMsg = payload.new as Message;
            if (
              (newMsg.sender_id === user.id && newMsg.receiver_id === participantId) ||
              (newMsg.sender_id === participantId && newMsg.receiver_id === user.id)
            ) {
              setMessages(prev => [...prev, newMsg]);
              
              // Mark as read if we're the receiver
              if (newMsg.receiver_id === user.id) {
                supabase
                  .from('messages')
                  .update({ is_read: true })
                  .eq('id', newMsg.id);
              }
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, participantId, fetchMessages]);

  const sendMessage = async (content: string, propertyId?: string) => {
    if (!user || !participantId) return { error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          content,
          sender_id: user.id,
          receiver_id: participantId,
          property_id: propertyId || null
        });

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Error sending message:', error);
      return { error: error.message };
    }
  };

  return {
    messages,
    loading,
    sendMessage,
    refetch: fetchMessages
  };
};