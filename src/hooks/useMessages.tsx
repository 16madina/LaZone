import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';
import { getSoundInstance } from './useSound';

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
  reply_to_id?: string | null;
  reply_to?: Message | null;
}

interface Conversation {
  id: string; // property_id + participant_id combo
  participantId: string;
  participantName: string;
  participantAvatar: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  propertyId: string;
  propertyTitle: string;
  propertyImage?: string;
  propertyOwnerId?: string; // To know if user is the property owner
}

export const useMessages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [archivedConversations, setArchivedConversations] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [totalUnread, setTotalUnread] = useState(0);

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch archived conversations first
      const { data: archived } = await supabase
        .from('archived_conversations')
        .select('other_user_id')
        .eq('user_id', user.id);
      
      const archivedSet = new Set(archived?.map(a => a.other_user_id) || []);
      setArchivedConversations(archivedSet);

      // Fetch all messages where user is sender or receiver AND have a property_id
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .not('property_id', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group messages by property_id + participant_id
      const conversationMap = new Map<string, Message[]>();
      
      messages?.forEach(msg => {
        const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        const propertyId = msg.property_id;
        
        // Skip archived conversations
        if (archivedSet.has(`${propertyId}_${otherUserId}`)) return;
        
        const conversationKey = `${propertyId}_${otherUserId}`;
        const existing = conversationMap.get(conversationKey) || [];
        existing.push(msg as Message);
        conversationMap.set(conversationKey, existing);
      });

      if (conversationMap.size === 0) {
        setConversations([]);
        setTotalUnread(0);
        setLoading(false);
        return;
      }

      // Get unique participant IDs and property IDs
      const participantIds = new Set<string>();
      const propertyIds = new Set<string>();
      
      conversationMap.forEach((msgs, key) => {
        const [propId, partId] = key.split('_');
        propertyIds.add(propId);
        participantIds.add(partId);
      });

      // Fetch participant profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', Array.from(participantIds));

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Fetch property info
      const { data: properties } = await supabase
        .from('properties')
        .select(`
          id, 
          title,
          user_id,
          property_images (url, is_primary)
        `)
        .in('id', Array.from(propertyIds));
      
      const propertyMap = new Map(properties?.map(p => [
        p.id, 
        { 
          title: p.title, 
          image: p.property_images?.find((img: any) => img.is_primary)?.url || p.property_images?.[0]?.url,
          ownerId: p.user_id
        }
      ]) || []);

      // Build conversations list
      const convList: Conversation[] = [];
      let totalUnreadCount = 0;

      conversationMap.forEach((msgs, conversationKey) => {
        const [propertyId, participantId] = conversationKey.split('_');
        const profile = profileMap.get(participantId);
        const propertyInfo = propertyMap.get(propertyId);
        const lastMsg = msgs[0];
        const unreadCount = msgs.filter(m => m.receiver_id === user.id && !m.is_read).length;
        totalUnreadCount += unreadCount;

        let lastMessageText = lastMsg.content;
        if (lastMsg.attachment_url && !lastMsg.content) {
          lastMessageText = lastMsg.attachment_type === 'image' ? '📷 Image' : '📎 Fichier';
        }

        convList.push({
          id: conversationKey,
          participantId,
          participantName: profile?.full_name || 'Utilisateur',
          participantAvatar: profile?.avatar_url || null,
          lastMessage: lastMessageText,
          lastMessageTime: lastMsg.created_at,
          unreadCount,
          propertyId,
          propertyTitle: propertyInfo?.title || 'Annonce supprimée',
          propertyImage: propertyInfo?.image,
          propertyOwnerId: propertyInfo?.ownerId
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
              
              // Play message notification sound
              try {
                const sound = getSoundInstance();
                sound.playMessageSound();
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

  const deleteConversation = async (conversationId: string) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const [propertyId, participantId] = conversationId.split('_');
      
      // Delete all messages for this property + participant combination
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('property_id', propertyId)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${participantId}),and(sender_id.eq.${participantId},receiver_id.eq.${user.id})`);

      if (error) throw error;
      
      // Update local state
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      return { error: null };
    } catch (error: any) {
      console.error('Error deleting conversation:', error);
      return { error: error.message };
    }
  };

  const archiveConversation = async (conversationId: string) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const [propertyId, participantId] = conversationId.split('_');
      
      const { error } = await supabase
        .from('archived_conversations')
        .insert({
          user_id: user.id,
          other_user_id: `${propertyId}_${participantId}`
        });

      if (error) throw error;
      
      // Update local state
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      setArchivedConversations(prev => new Set([...prev, conversationId]));
      return { error: null };
    } catch (error: any) {
      console.error('Error archiving conversation:', error);
      return { error: error.message };
    }
  };

  const unarchiveConversation = async (participantId: string) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('archived_conversations')
        .delete()
        .eq('user_id', user.id)
        .eq('other_user_id', participantId);

      if (error) throw error;
      
      setArchivedConversations(prev => {
        const newSet = new Set(prev);
        newSet.delete(participantId);
        return newSet;
      });
      await fetchConversations();
      return { error: null };
    } catch (error: any) {
      console.error('Error unarchiving conversation:', error);
      return { error: error.message };
    }
  };

  return {
    conversations,
    loading,
    totalUnread,
    refetch: fetchConversations,
    deleteConversation,
    archiveConversation,
    unarchiveConversation
  };
};

export const useConversation = (participantId: string | null, propertyId: string | null) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!user || !participantId || !propertyId) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('property_id', propertyId)
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

      // Build messages with reactions and reply references
      const messagesWithReactions = (data || []).map(m => {
        const replyTo = m.reply_to_id ? data?.find(msg => msg.id === m.reply_to_id) : null;
        return {
          ...m,
          reactions: reactionsMap.get(m.id) || [],
          reply_to: replyTo ? { ...replyTo, reactions: [] } : null
        };
      }) as Message[];

      setMessages(messagesWithReactions);

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('receiver_id', user.id)
        .eq('sender_id', participantId)
        .eq('property_id', propertyId)
        .eq('is_read', false);

    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [user, participantId, propertyId]);

  useEffect(() => {
    if (user && participantId && propertyId) {
      fetchMessages();

      // Subscribe to realtime updates for messages
      const messagesChannel = supabase
        .channel(`conversation-${propertyId}-${participantId}`)
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
                newMsg.property_id === propertyId &&
                ((newMsg.sender_id === user.id && newMsg.receiver_id === participantId) ||
                (newMsg.sender_id === participantId && newMsg.receiver_id === user.id))
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
        .channel(`typing-${propertyId}-${[user.id, participantId].sort().join('-')}`)
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
  }, [user, participantId, propertyId, fetchMessages]);

  const sendMessage = async (content: string, attachment?: { url: string; type: 'image' | 'file'; name: string }, replyToId?: string) => {
    if (!user || !participantId || !propertyId) return { error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          content,
          sender_id: user.id,
          receiver_id: participantId,
          property_id: propertyId,
          attachment_url: attachment?.url || null,
          attachment_type: attachment?.type || null,
          attachment_name: attachment?.name || null,
          reply_to_id: replyToId || null
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
