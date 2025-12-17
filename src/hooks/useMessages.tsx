import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  property_id: string | null;
  is_read: boolean | null;
  created_at: string;
  attachment_url?: string | null;
  attachment_type?: string | null;
  attachment_name?: string | null;
  reactions?: MessageReaction[];
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
        existing.push(msg as Message);
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

        let lastMessageText = lastMsg.content;
        if (lastMsg.attachment_url && !lastMsg.content) {
          lastMessageText = lastMsg.attachment_type === 'image' ? '📷 Image' : '📎 Fichier';
        }

        convList.push({
          id: participantId,
          participantId,
          participantName: profile?.full_name || 'Utilisateur',
          participantAvatar: profile?.avatar_url || null,
          lastMessage: lastMessageText,
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
            
            // Show toast and play sound for new messages
            if (payload.eventType === 'INSERT') {
              toast({
                title: 'Nouveau message',
                description: 'Vous avez reçu un nouveau message',
              });
              
              // Play notification sound
              try {
                const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleShSp93teleShSp+r4VsXV90n6a1iP//////////');
                audio.volume = 0.5;
                audio.play().catch(() => {});
              } catch (e) {
                // Ignore audio errors
              }
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
  const [isTyping, setIsTyping] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!user || !participantId) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${participantId}),and(sender_id.eq.${participantId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch reactions for all messages
      const messageIds = data?.map(m => m.id) || [];
      let reactionsMap = new Map<string, MessageReaction[]>();

      if (messageIds.length > 0) {
        const { data: reactions } = await supabase
          .from('message_reactions')
          .select('*')
          .in('message_id', messageIds);

        reactions?.forEach(r => {
          const existing = reactionsMap.get(r.message_id) || [];
          existing.push(r as MessageReaction);
          reactionsMap.set(r.message_id, existing);
        });
      }

      const messagesWithReactions = (data || []).map(m => ({
        ...m,
        reactions: reactionsMap.get(m.id) || []
      })) as Message[];

      setMessages(messagesWithReactions);

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

      // Subscribe to realtime updates for messages
      const messagesChannel = supabase
        .channel(`conversation-${participantId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages'
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
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
            } else if (payload.eventType === 'UPDATE') {
              const updatedMsg = payload.new as Message;
              setMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
            }
          }
        )
        .subscribe();

      // Subscribe to typing presence
      const typingChannel = supabase
        .channel(`typing-${[user.id, participantId].sort().join('-')}`)
        .on('presence', { event: 'sync' }, () => {
          const state = typingChannel.presenceState();
          const otherUserTyping = Object.values(state).some((presences: any) =>
            presences.some((p: any) => p.user_id === participantId && p.is_typing)
          );
          setIsTyping(otherUserTyping);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(messagesChannel);
        supabase.removeChannel(typingChannel);
      };
    }
  }, [user, participantId, fetchMessages]);

  const sendMessage = async (content: string, propertyId?: string, attachment?: { url: string; type: 'image' | 'file'; name: string }) => {
    if (!user || !participantId) return { error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          content,
          sender_id: user.id,
          receiver_id: participantId,
          property_id: propertyId || null,
          attachment_url: attachment?.url || null,
          attachment_type: attachment?.type || null,
          attachment_name: attachment?.name || null
        });

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Error sending message:', error);
      return { error: error.message };
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) throw error;
      setMessages(prev => prev.filter(m => m.id !== messageId));
      return { error: null };
    } catch (error: any) {
      console.error('Error deleting message:', error);
      return { error: error.message };
    }
  };

  const addReaction = async (messageId: string, emoji: string) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('message_reactions')
        .insert({
          message_id: messageId,
          user_id: user.id,
          emoji
        });

      if (error) {
        // If duplicate, remove reaction instead
        if (error.code === '23505') {
          return removeReaction(messageId, emoji);
        }
        throw error;
      }
      await fetchMessages();
      return { error: null };
    } catch (error: any) {
      console.error('Error adding reaction:', error);
      return { error: error.message };
    }
  };

  const removeReaction = async (messageId: string, emoji: string) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('emoji', emoji);

      if (error) throw error;
      await fetchMessages();
      return { error: null };
    } catch (error: any) {
      console.error('Error removing reaction:', error);
      return { error: error.message };
    }
  };

  const uploadAttachment = async (file: File): Promise<{ url: string; type: 'image' | 'file'; name: string } | null> => {
    if (!user) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const isImage = file.type.startsWith('image/');

      const { data, error } = await supabase.storage
        .from('property-images') // Reusing existing bucket
        .upload(`messages/${fileName}`, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('property-images')
        .getPublicUrl(`messages/${fileName}`);

      return {
        url: urlData.publicUrl,
        type: isImage ? 'image' : 'file',
        name: file.name
      };
    } catch (error) {
      console.error('Error uploading attachment:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer le fichier',
        variant: 'destructive'
      });
      return null;
    }
  };

  const setTyping = useCallback(async (typing: boolean) => {
    if (!user || !participantId) return;
    
    const channelName = `typing-${[user.id, participantId].sort().join('-')}`;
    const channel = supabase.channel(channelName);
    
    await channel.track({
      user_id: user.id,
      is_typing: typing
    });
  }, [user, participantId]);

  return {
    messages,
    loading,
    sendMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    uploadAttachment,
    refetch: fetchMessages,
    isTyping,
    setTyping
  };
};
