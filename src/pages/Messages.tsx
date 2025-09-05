import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageCircle, 
  Calendar, 
  Bell, 
  Search,
  Send,
  Phone,
  User,
  Home,
  MapPin,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/utils/currency';

interface Conversation {
  id: string;
  buyer_id: string;
  seller_id: string;
  listing_id?: string;
  status: string;
  last_message_at?: string;
  created_at: string;
  unread_count?: number;
  listings?: {
    title: string;
    price: number;
    currency: string;
  };
  buyer_profile?: {
    first_name: string;
    last_name?: string;
    user_type: string;
    phone?: string;
    agency_name?: string;
  };
  seller_profile?: {
    first_name: string;
    last_name?: string;
    user_type: string;
    phone?: string;
    agency_name?: string;
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
}

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
    }
  }, [activeConversation]);

  const fetchConversations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Récupérer les profils des utilisateurs séparément
      const conversationsWithProfiles = await Promise.all(
        (data || []).map(async (conv) => {
          // Récupérer le profil de l'acheteur
          const { data: buyerProfile, error: buyerError } = await supabase
            .from('profiles')
            .select('first_name, last_name, user_type, phone, agency_name')
            .eq('user_id', conv.buyer_id)
            .maybeSingle();

          // Récupérer le profil du vendeur
          const { data: sellerProfile, error: sellerError } = await supabase
            .from('profiles')
            .select('first_name, last_name, user_type, phone, agency_name')
            .eq('user_id', conv.seller_id)
            .maybeSingle();

          if (buyerError) console.error('Error fetching buyer profile:', buyerError);
          if (sellerError) console.error('Error fetching seller profile:', sellerError);

          console.log('Debug - Conversation:', conv.id, 'Buyer Profile:', buyerProfile, 'Seller Profile:', sellerProfile);

          // Calculer le nombre de messages non lus
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact' })
            .eq('conversation_id', conv.id)
            .eq('read', false)
            .neq('sender_id', user.id);

          return { 
            ...conv, 
            buyer_profile: buyerProfile,
            seller_profile: sellerProfile,
            unread_count: count || 0 
          };
        })
      );

      setConversations(conversationsWithProfiles as Conversation[]);
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
      
      // Rafraîchir les conversations pour mettre à jour les compteurs
      fetchConversations();
    } catch (error) {
      console.error('Error marking messages as read:', error);
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
      // L'utilisateur actuel est l'acheteur, donc afficher le nom du vendeur
      const sellerProfile = conversation.seller_profile;
      if (sellerProfile?.first_name) {
        return `${sellerProfile.first_name}${sellerProfile.last_name ? ` ${sellerProfile.last_name}` : ''}`;
      }
      // Si pas de prénom, essayer le nom d'agence
      if (sellerProfile?.agency_name) {
        return sellerProfile.agency_name;
      }
      return 'Vendeur';
    } else {
      // L'utilisateur actuel est le vendeur, donc afficher le nom de l'acheteur
      const buyerProfile = conversation.buyer_profile;
      if (buyerProfile?.first_name) {
        return `${buyerProfile.first_name}${buyerProfile.last_name ? ` ${buyerProfile.last_name}` : ''}`;
      }
      // Si pas de prénom, essayer le nom d'agence
      if (buyerProfile?.agency_name) {
        return buyerProfile.agency_name;
      }
      return 'Acheteur';
    }
  };

  const filteredConversations = conversations.filter(conv =>
    getOtherUserName(conv).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnreadMessages = conversations.reduce((total, conv) => total + (conv.unread_count || 0), 0);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-main">
        <Header />
        <div className="container mx-auto px-4 pt-20 pb-24">
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Connectez-vous pour voir vos messages</h2>
            <p className="text-muted-foreground">Accédez à vos conversations et interactions</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-main">
      <Header />
      
      <div className="container mx-auto px-4 pt-20 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Messages</h1>
              <p className="text-muted-foreground">
                Gérez vos conversations avec les acheteurs et vendeurs
              </p>
            </div>
          </div>

          <Tabs defaultValue="conversations" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="conversations" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Conversations
                {totalUnreadMessages > 0 && (
                  <Badge variant="destructive" className="ml-1 text-xs">
                    {totalUnreadMessages}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="visits" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Demandes (Bientôt)
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notifications (Bientôt)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="conversations" className="space-y-4">
              {!activeConversation ? (
                <div className="bg-gradient-card rounded-lg border shadow-sm">
                  <div className="p-6 border-b">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold">Vos conversations</h2>
                      <Badge variant="secondary">
                        {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Rechercher une conversation..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <ScrollArea className="h-[600px]">
                    {loading ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : filteredConversations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-32 text-center p-6">
                        <MessageCircle className="w-12 h-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Aucune conversation</h3>
                        <p className="text-muted-foreground">
                          Vos conversations apparaîtront ici
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-0">
                        {filteredConversations.map((conversation) => (
                          <div
                            key={conversation.id}
                            className="p-6 cursor-pointer hover:bg-muted/50 transition-colors border-b last:border-b-0"
                            onClick={() => setActiveConversation(conversation)}
                          >
                            <div className="flex items-center gap-4">
                              <Avatar className="w-12 h-12">
                                <AvatarFallback>
                                  <User className="w-6 h-6" />
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="text-sm font-medium flex items-center gap-2">
                                    {getOtherUserName(conversation)}
                                    {conversation.unread_count! > 0 && (
                                      <Badge variant="destructive" className="text-xs">
                                        {conversation.unread_count}
                                      </Badge>
                                    )}
                                  </h4>
                                  {conversation.last_message_at && (
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(conversation.last_message_at).toLocaleDateString('fr-FR', {
                                        day: 'numeric',
                                        month: 'short',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant={conversation.status === 'active' ? 'default' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {conversation.status === 'active' ? 'Active' : 'Fermée'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              ) : (
                // Vue de conversation active
                <div className="bg-gradient-card rounded-lg border shadow-sm h-[600px] flex flex-col">
                  {/* Header de conversation */}
                  <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveConversation(null)}
                      >
                        ← Retour
                      </Button>
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>
                          <User className="w-5 h-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-medium">
                          {getOtherUserName(activeConversation)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Conversation
                        </p>
                      </div>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        const otherUser = activeConversation.buyer_id === user?.id 
                          ? activeConversation.seller_profile 
                          : activeConversation.buyer_profile;
                        
                        if (otherUser?.phone) {
                          window.open(`tel:${otherUser.phone}`, '_self');
                        } else {
                          toast({
                            title: 'Numéro non disponible',
                            description: 'Ce contact n\'a pas partagé son numéro de téléphone',
                            variant: 'destructive'
                          });
                        }
                      }}
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-6">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={cn(
                            "flex gap-3",
                            message.sender_id === user?.id ? "justify-end" : "justify-start"
                          )}
                        >
                          {message.sender_id !== user?.id && (
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>
                                <User className="w-4 h-4" />
                              </AvatarFallback>
                            </Avatar>
                          )}
                          
                          <div
                            className={cn(
                              "max-w-[70%] rounded-lg px-4 py-3",
                              message.sender_id === user?.id
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            )}
                          >
                            <p className="text-sm">{message.message}</p>
                            <span
                              className={cn(
                                "text-xs opacity-70 mt-2 block",
                                message.sender_id === user?.id
                                  ? "text-primary-foreground/70"
                                  : "text-muted-foreground"
                              )}
                            >
                              {new Date(message.created_at).toLocaleString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Input de message */}
                  <div className="p-6 border-t">
                    <div className="flex items-center gap-3">
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
                        className="flex-1"
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
                </div>
              )}
            </TabsContent>

            <TabsContent value="visits" className="space-y-4">
              <div className="bg-gradient-card rounded-lg border shadow-sm">
                <div className="p-6">
                  <div className="flex flex-col items-center justify-center h-32 text-center">
                    <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Fonctionnalité à venir</h3>
                    <p className="text-muted-foreground">
                      Les demandes de visite seront bientôt disponibles
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <div className="bg-gradient-card rounded-lg border shadow-sm">
                <div className="p-6">
                  <div className="flex flex-col items-center justify-center h-32 text-center">
                    <Bell className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Fonctionnalité à venir</h3>
                    <p className="text-muted-foreground">
                      Les notifications seront bientôt disponibles
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}