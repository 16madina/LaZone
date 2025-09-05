import React, { useState, useEffect, useRef } from 'react';
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
  Clock,
  Wifi,
  WifiOff
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
    address?: string;
    city?: string;
    property_type?: string;
  };
  buyer_profile?: {
    first_name?: string;
    last_name?: string;
    user_type: string;
    phone?: string;
    agency_name?: string;
  };
  seller_profile?: {
    first_name?: string;
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
  const [isOnline, setIsOnline] = useState(true);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesChannelRef = useRef<any>(null);
  const conversationsChannelRef = useRef<any>(null);
  const presenceChannelRef = useRef<any>(null);

  // Fonction pour faire défiler automatiquement vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll automatique quand les messages changent
  useEffect(() => {
    const scrollToBottomImmediate = () => {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    };
    scrollToBottomImmediate();
  }, [messages]);

  // Configuration du système temps réel pour les messages
  useEffect(() => {
    if (!user || !activeConversation) return;

    console.log('🔄 Setting up realtime for conversation:', activeConversation.id);

    // Nettoyer les anciens abonnements
    if (messagesChannelRef.current) {
      console.log('🧹 Cleaning up old messages channel');
      supabase.removeChannel(messagesChannelRef.current);
    }

    // Créer un nouveau channel pour cette conversation
    const channel = supabase
      .channel(`messages-${activeConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${activeConversation.id}`
        },
        (payload) => {
          console.log('📨 New message received:', payload.new);
          const newMessage = payload.new as Message;
          setMessages(prev => {
            const exists = prev.find(m => m.id === newMessage.id);
            if (exists) return prev;
            const updated = [...prev, newMessage].sort((a, b) => 
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
            // Force scroll après ajout du message
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }, 50);
            return updated;
          });

          // Marquer comme lu automatiquement si l'expéditeur n'est pas l'utilisateur actuel
          if (newMessage.sender_id !== user.id) {
            setTimeout(() => markMessagesAsRead(activeConversation.id), 1000);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${activeConversation.id}`
        },
        (payload) => {
          console.log('📝 Message updated:', payload.new);
          const updatedMessage = payload.new as Message;
          setMessages(prev => 
            prev.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
          );
        }
      )
      .subscribe((status) => {
        console.log('📡 Messages channel status:', status);
        setIsOnline(status === 'SUBSCRIBED');
      });

    messagesChannelRef.current = channel;

    return () => {
      console.log('🧹 Cleaning up messages channel');
      if (messagesChannelRef.current) {
        supabase.removeChannel(messagesChannelRef.current);
        messagesChannelRef.current = null;
      }
    };
  }, [user, activeConversation]);

  // Configuration du système temps réel pour les conversations
  useEffect(() => {
    if (!user) return;

    console.log('🔄 Setting up realtime for conversations');

    // Nettoyer les anciens abonnements
    if (conversationsChannelRef.current) {
      console.log('🧹 Cleaning up old conversations channel');
      supabase.removeChannel(conversationsChannelRef.current);
    }

    const channel = supabase
      .channel('user-conversations')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversations',
          filter: `buyer_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🆕 New conversation (as buyer):', payload.new);
          fetchConversations(); // Recharger toutes les conversations
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversations',
          filter: `seller_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🆕 New conversation (as seller):', payload.new);
          fetchConversations(); // Recharger toutes les conversations
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations'
        },
        (payload) => {
          const updatedConv = payload.new as any;
          if (updatedConv.buyer_id === user.id || updatedConv.seller_id === user.id) {
            console.log('📝 Conversation updated:', updatedConv);
            fetchConversations(); // Recharger pour mettre à jour les compteurs
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Conversations channel status:', status);
        setIsOnline(status === 'SUBSCRIBED');
      });

    conversationsChannelRef.current = channel;

    return () => {
      console.log('🧹 Cleaning up conversations channel');
      if (conversationsChannelRef.current) {
        supabase.removeChannel(conversationsChannelRef.current);
        conversationsChannelRef.current = null;
      }
    };
  }, [user]);

  // Système de présence utilisateur
  useEffect(() => {
    if (!user) return;

    console.log('🔄 Setting up user presence');

    const channel = supabase.channel('user-presence')
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        console.log('👥 Presence sync:', state);
        const onlineUserIds = new Set<string>();
        Object.values(state).forEach((presences: any[]) => {
          presences.forEach((presence: any) => {
            if (presence.user_id) {
              onlineUserIds.add(presence.user_id);
            }
          });
        });
        setOnlineUsers(onlineUserIds);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('👋 User joined:', key, newPresences);
        newPresences.forEach((presence: any) => {
          if (presence.user_id) {
            setOnlineUsers(prev => new Set([...prev, presence.user_id]));
          }
        });
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('👋 User left:', key, leftPresences);
        leftPresences.forEach((presence: any) => {
          if (presence.user_id) {
            setOnlineUsers(prev => {
              const updated = new Set(prev);
              updated.delete(presence.user_id);
              return updated;
            });
          }
        });
      })
      .subscribe(async (status) => {
        console.log('📡 Presence channel status:', status);
        if (status === 'SUBSCRIBED') {
          const presenceStatus = await channel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });
          console.log('📍 Presence tracked:', presenceStatus);
        }
      });

    presenceChannelRef.current = channel;

    // Cleanup au démontage
    return () => {
      console.log('🧹 Cleaning up presence channel');
      if (presenceChannelRef.current) {
        supabase.removeChannel(presenceChannelRef.current);
        presenceChannelRef.current = null;
      }
    };
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
      // Marquer automatiquement les messages comme lus quand on ouvre une conversation
      setTimeout(() => markMessagesAsRead(activeConversation.id), 500);
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

      // Récupérer les profils des utilisateurs et les informations sur les biens
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

          // Récupérer les informations sur le bien immobilier si disponible
          let listing = null;
          if (conv.listing_id) {
            const { data: listingData, error: listingError } = await supabase
              .from('listings')
              .select('title, price, currency, address, city, property_type')
              .eq('id', conv.listing_id)
              .maybeSingle();
            
            if (listingError) {
              console.error('Error fetching listing:', listingError);
            } else {
              listing = listingData;
            }
          }

          if (buyerError) console.error('Error fetching buyer profile:', buyerError);
          if (sellerError) console.error('Error fetching seller profile:', sellerError);

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
            listings: listing,
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

  const filteredConversations = conversations.filter(conv => {
    const otherUserName = getOtherUserName(conv).toLowerCase();
    const listingTitle = conv.listings?.title?.toLowerCase() || '';
    const searchTerm = searchQuery.toLowerCase();
    
    return otherUserName.includes(searchTerm) || listingTitle.includes(searchTerm);
  });

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
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                Messages
                <div className="flex items-center gap-2">
                  {isOnline ? (
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <Wifi className="w-4 h-4" />
                      <span className="text-xs">En ligne</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-sm text-red-500">
                      <WifiOff className="w-4 h-4" />
                      <span className="text-xs">Hors ligne</span>
                    </div>
                  )}
                </div>
              </h1>
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
                        placeholder="Rechercher par nom ou bien immobilier..."
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
                            <div className="flex items-start gap-4">
                              <Avatar className="w-12 h-12 mt-1">
                                <AvatarFallback>
                                  {conversation.buyer_id === user?.id ? (
                                    <Home className="w-6 h-6" />
                                  ) : (
                                    <User className="w-6 h-6" />
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-medium flex items-center gap-2">
                                      {getOtherUserName(conversation)}
                                      {/* Indicateur de présence */}
                                      {onlineUsers.has(conversation.buyer_id === user?.id ? conversation.seller_id : conversation.buyer_id) && (
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="En ligne" />
                                      )}
                                    </h4>
                                    {conversation.unread_count! > 0 && (
                                      <Badge variant="destructive" className="text-xs">
                                        {conversation.unread_count}
                                      </Badge>
                                    )}
                                  </div>
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
                                
                                {/* Informations sur le bien */}
                                {conversation.listings && (
                                  <div className="mb-2">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Home className="w-3 h-3 text-muted-foreground" />
                                      <span className="text-sm text-foreground font-medium truncate">
                                        {conversation.listings.title}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                      <span className="font-medium text-primary">
                                        {formatPrice(conversation.listings.price, conversation.listings.currency)}
                                      </span>
                                      {conversation.listings.property_type && (
                                        <span className="capitalize">{conversation.listings.property_type}</span>
                                      )}
                                      {conversation.listings.city && (
                                        <div className="flex items-center gap-1">
                                          <MapPin className="w-3 h-3" />
                                          <span>{conversation.listings.city}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                                
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant={conversation.status === 'active' ? 'default' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {conversation.status === 'active' ? 'Active' : 'Fermée'}
                                  </Badge>
                                  {!conversation.listings && (
                                    <Badge variant="outline" className="text-xs">
                                      Conversation générale
                                    </Badge>
                                  )}
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
                          {activeConversation.buyer_id === user?.id ? (
                            <Home className="w-5 h-5" />
                          ) : (
                            <User className="w-5 h-5" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                       <div className="flex-1">
                         <h3 className="text-lg font-medium flex items-center gap-2">
                           {getOtherUserName(activeConversation)}
                           {/* Indicateur de présence dans l'en-tête */}
                           {onlineUsers.has(activeConversation.buyer_id === user?.id ? activeConversation.seller_id : activeConversation.buyer_id) && (
                             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="En ligne" />
                           )}
                         </h3>
                        {activeConversation.listings ? (
                          <div className="text-sm text-muted-foreground">
                            <div className="flex items-center gap-2 mb-1">
                              <Home className="w-3 h-3" />
                              <span className="font-medium text-foreground truncate">
                                {activeConversation.listings.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                              <span className="font-medium text-primary">
                                {formatPrice(activeConversation.listings.price, activeConversation.listings.currency)}
                              </span>
                              {activeConversation.listings.city && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{activeConversation.listings.city}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Conversation générale
                          </p>
                        )}
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
                       {/* Référence pour le scroll automatique */}
                       <div ref={messagesEndRef} />
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