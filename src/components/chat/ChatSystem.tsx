import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, User, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface Conversation {
  id: string;
  listing_id?: string;
  buyer_id: string;
  seller_id: string;
  status: string;
  last_message_at?: string;
  created_at: string;
  listing?: {
    title: string;
    price: number;
    currency: string;
  };
  participant?: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    user_type: string;
  };
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  message_type: string;
  read: boolean;
  created_at: string;
  sender?: {
    first_name?: string;
    last_name?: string;
  };
}

interface ChatSystemProps {
  listingId?: string;
  sellerId?: string;
  triggerButton?: React.ReactNode;
}

const ChatSystem: React.FC<ChatSystemProps> = ({ listingId, sellerId, triggerButton }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    fetchConversations();
    
    // Setup realtime subscriptions
    const messagesChannel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          if (activeConversation) {
            fetchMessages(activeConversation.id);
          }
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [user, activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false, nullsFirst: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return;
    }

    // Fetch participant info for each conversation
    const conversationsWithParticipants = await Promise.all(
      (data || []).map(async (conv) => {
        const participantId = conv.buyer_id === user.id ? conv.seller_id : conv.buyer_id;
        const { data: participant } = await supabase
          .from('profiles')
          .select('first_name, last_name, phone, user_type')
          .eq('user_id', participantId)
          .single();

        return {
          ...conv,
          participant,
          listing: null
        };
      })
    );

    setConversations(conversationsWithParticipants);

    // Count unread messages
    const { data: unreadData } = await supabase
      .from('messages')
      .select('id')
      .neq('sender_id', user.id)
      .eq('read', false)
      .in('conversation_id', conversationsWithParticipants.map(c => c.id));

    setUnreadCount(unreadData?.length || 0);
  };

  const fetchMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        profiles:sender_id(first_name, last_name)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    setMessages(data || []);

    // Mark messages as read
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', user?.id);
  };

  const startConversation = async () => {
    if (!user || !listingId || !sellerId) return;

    // Check if conversation already exists
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('id')
      .eq('listing_id', listingId)
      .eq('buyer_id', user.id)
      .eq('seller_id', sellerId)
      .single();

    if (existingConv) {
      const conversation = conversations.find(c => c.id === existingConv.id);
      if (conversation) {
        setActiveConversation(conversation);
        fetchMessages(existingConv.id);
        return;
      }
    }

    // Create new conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        listing_id: listingId,
        buyer_id: user.id,
        seller_id: sellerId
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de démarrer la conversation",
        variant: "destructive"
      });
      return;
    }

    fetchConversations();
    setActiveConversation(data);
    setIsOpen(true);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || !user) return;

    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: activeConversation.id,
        sender_id: user.id,
        message: newMessage.trim()
      });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive"
      });
      return;
    }

    // Update conversation last_message_at
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', activeConversation.id);

    setNewMessage('');
    fetchMessages(activeConversation.id);
  };

  if (!user) return null;

  // For starting a new conversation from a listing
  if (listingId && sellerId && !isOpen) {
    return (
      <Button onClick={startConversation} className="w-full">
        <MessageCircle className="w-4 h-4 mr-2" />
        Contacter le vendeur
      </Button>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {triggerButton || (
          <Button variant="ghost" size="sm" className="relative p-2">
            <MessageCircle className="w-5 h-5" />
            {unreadCount > 0 && (
              <Badge 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                variant="destructive"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>
        )}
      </SheetTrigger>
      
      <SheetContent side="right" className="w-96 p-0">
        {!activeConversation ? (
          <>
            <SheetHeader className="p-6 border-b">
              <SheetTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Messages
              </SheetTitle>
            </SheetHeader>

            <ScrollArea className="h-full pb-20">
              <div className="p-4 space-y-4">
                {conversations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucune conversation</p>
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <Card 
                      key={conversation.id}
                      className="cursor-pointer hover:shadow-md transition-all"
                      onClick={() => {
                        setActiveConversation(conversation);
                        fetchMessages(conversation.id);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback>
                              <User className="w-5 h-5" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm">
                              {conversation.participant?.first_name} {conversation.participant?.last_name}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {conversation.participant?.user_type === 'agence' ? 'Agence' : 'Particulier'}
                            </p>
                            {conversation.listing && (
                              <p className="text-xs text-muted-foreground truncate">
                                {conversation.listing.title}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </>
        ) : (
          <>
            <SheetHeader className="p-4 border-b">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveConversation(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
                <Avatar className="w-8 h-8">
                  <AvatarFallback>
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">
                    {activeConversation.participant?.first_name} {activeConversation.participant?.last_name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {activeConversation.participant?.user_type === 'agence' ? 'Agence' : 'Particulier'}
                  </p>
                </div>
                <div className="flex gap-1">
                  {activeConversation.participant?.phone && (
                    <Button variant="ghost" size="sm" className="p-2">
                      <Phone className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </SheetHeader>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_id === user.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.sender_id === user.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(message.created_at).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Tapez votre message..."
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button onClick={sendMessage} size="sm">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ChatSystem;