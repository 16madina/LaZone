import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Phone, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Conversation {
  id: string;
  buyer_id: string;
  seller_id: string;
  listing_id?: string;
  status: string;
  last_message_at?: string;
  created_at: string;
  listing?: {
    title: string;
    price: number;
    currency: string;
  };
  other_user?: {
    name: string;
    avatar?: string;
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
    name: string;
    avatar?: string;
  };
}

interface ChatSystemProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId?: string;
  sellerId?: string;
}

export function ChatSystem({ isOpen, onClose, propertyId, sellerId }: ChatSystemProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchConversations();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
    }
  }, [activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          listings!left (title, price, currency)
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les conversations',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Marquer les messages comme lus
      await markMessagesAsRead(conversationId);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markMessagesAsRead = async (conversationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .eq('read', false);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const createConversation = async () => {
    if (!user || !sellerId) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          buyer_id: user.id,
          seller_id: sellerId,
          listing_id: propertyId,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      setActiveConversation(data);
      fetchConversations();
      
      toast({
        title: 'Succès',
        description: 'Conversation créée'
      });
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la conversation',
        variant: 'destructive'
      });
    }
  };

  const sendMessage = async () => {
    if (!user || !activeConversation || !newMessage.trim()) return;

    setSendingMessage(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: activeConversation.id,
          sender_id: user.id,
          message: newMessage.trim(),
          message_type: 'text'
        });

      if (error) throw error;

      // Mettre à jour la conversation avec le timestamp du dernier message
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', activeConversation.id);

      setNewMessage('');
      fetchMessages(activeConversation.id);
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer le message',
        variant: 'destructive'
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const getOtherUserName = (conversation: Conversation) => {
    if (!user) return 'Utilisateur';
    
    if (conversation.buyer_id === user.id) {
      return 'Vendeur'; // L'utilisateur est l'acheteur, donc l'autre est le vendeur
    } else {
      return 'Acheteur'; // L'utilisateur est le vendeur, donc l'autre est l'acheteur
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-gradient-card shadow-xl animate-slide-up">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Messages</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {!activeConversation ? (
            // Liste des conversations
            <ScrollArea className="flex-1">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center p-6">
                  <MessageCircle className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground mb-2">Aucune conversation</p>
                  {propertyId && sellerId && (
                    <Button onClick={createConversation} size="sm">
                      Démarrer une conversation
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-0">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className="p-4 cursor-pointer hover:bg-muted/50 transition-colors border-b"
                      onClick={() => setActiveConversation(conversation)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>
                            <User className="w-5 h-5" />
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">
                              {getOtherUserName(conversation)}
                            </h4>
                            {conversation.last_message_at && (
                              <span className="text-xs text-muted-foreground">
                                {new Date(conversation.last_message_at).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'short'
                                })}
                              </span>
                            )}
                          </div>
                          
                          {conversation.listing && (
                            <p className="text-xs text-muted-foreground truncate">
                              {conversation.listing.title}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          ) : (
            // Vue de conversation active
            <>
              {/* Header de conversation */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveConversation(null)}
                  >
                    ←
                  </Button>
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-sm font-medium">
                      {getOtherUserName(activeConversation)}
                    </h3>
                    {activeConversation.listing && (
                      <p className="text-xs text-muted-foreground">
                        {activeConversation.listing.title}
                      </p>
                    )}
                  </div>
                </div>
                
                <Button variant="ghost" size="sm">
                  <Phone className="w-4 h-4" />
                </Button>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-2",
                        message.sender_id === user?.id ? "justify-end" : "justify-start"
                      )}
                    >
                      {message.sender_id !== user?.id && (
                        <Avatar className="w-6 h-6">
                          <AvatarFallback>
                            <User className="w-3 h-3" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div
                        className={cn(
                          "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                          message.sender_id === user?.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        <p>{message.message}</p>
                        <span
                          className={cn(
                            "text-xs opacity-70 mt-1 block",
                            message.sender_id === user?.id
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          )}
                        >
                          {new Date(message.created_at).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input de message */}
              <div className="p-4 border-t">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Tapez votre message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    disabled={sendingMessage}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                    size="sm"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}