import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Info, Check, ExternalLink, MessageSquare, Heart, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'message' | 'favorite' | 'listing' | 'system';
  category: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  action_url?: string;
  metadata?: any;
  read: boolean;
  created_at: string;
}

interface EnhancedNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'message': return MessageSquare;
    case 'favorite': return Heart;
    case 'listing': return TrendingUp;
    case 'success': return CheckCircle;
    case 'warning': return AlertTriangle;
    case 'error': return AlertTriangle;
    default: return Info;
  }
};

const getNotificationColor = (category: string) => {
  switch (category) {
    case 'success': return 'text-green-600';
    case 'warning': return 'text-yellow-600';
    case 'error': return 'text-red-600';
    default: return 'text-primary';
  }
};

export function EnhancedNotificationCenter({ isOpen, onClose }: EnhancedNotificationCenterProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (isOpen && user) {
      fetchNotifications();
      setupRealTimeSubscription();
    }
  }, [isOpen, user]);

  const fetchNotifications = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Enhanced mock notifications with real-time capabilities
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'message',
          category: 'info',
          title: 'Nouveau message',
          message: 'Ahmed vous a envoyé un message concernant l\'appartement à Dakar',
          read: false,
          metadata: { conversation_id: 'conv_1', sender: 'Ahmed' },
          created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          type: 'favorite',
          category: 'success',
          title: 'Propriété ajoutée aux favoris',
          message: 'Villa à Almadies a été ajoutée à vos favoris',
          read: false,
          metadata: { listing_id: 'listing_1' },
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          type: 'listing',
          category: 'info',
          title: 'Nouvelle annonce correspondante',
          message: 'Nous avons trouvé un appartement 3 pièces à Dakar qui pourrait vous intéresser',
          read: true,
          metadata: { listing_id: 'listing_2', match_score: 85 },
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '4',
          type: 'system',
          category: 'warning',
          title: 'Demande de visite',
          message: 'Quelqu\'un souhaite visiter votre propriété demain à 14h',
          read: false,
          metadata: { visit_date: '2024-01-15T14:00:00Z' },
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        }
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les notifications',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeSubscription = () => {
    // Set up real-time subscriptions for new messages and listings
    const messagesChannel = supabase
      .channel('new-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        // Add new message notification
        const newNotification: Notification = {
          id: `msg_${Date.now()}`,
          type: 'message',
          category: 'info',
          title: 'Nouveau message',
          message: 'Vous avez reçu un nouveau message',
          read: false,
          metadata: { message_id: payload.new.id },
          created_at: new Date().toISOString()
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        
        toast({
          title: 'Nouveau message',
          description: 'Vous avez reçu un nouveau message'
        });
      })
      .subscribe();

    const listingsChannel = supabase
      .channel('new-listings')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'listings'
      }, (payload) => {
        // Add new listing notification
        const newNotification: Notification = {
          id: `listing_${Date.now()}`,
          type: 'listing',
          category: 'info',
          title: 'Nouvelle annonce',
          message: 'Une nouvelle propriété correspondant à vos critères est disponible',
          read: false,
          metadata: { listing_id: payload.new.id },
          created_at: new Date().toISOString()
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        
        toast({
          title: 'Nouvelle annonce',
          description: 'Une nouvelle propriété correspondant à vos critères'
        });
      })
      .subscribe();

    return () => {
      messagesChannel.unsubscribe();
      listingsChannel.unsubscribe();
    };
  };

  const markAsRead = async (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast({
      title: 'Succès',
      description: 'Toutes les notifications ont été marquées comme lues'
    });
  };

  const getFilteredNotifications = () => {
    if (activeTab === 'all') return notifications;
    return notifications.filter(n => n.type === activeTab);
  };

  const getUnreadCount = (type?: string) => {
    const filtered = type ? notifications.filter(n => n.type === type) : notifications;
    return filtered.filter(n => !n.read).length;
  };

  const filteredNotifications = getFilteredNotifications();
  const totalUnread = getUnreadCount();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-gradient-card shadow-xl animate-slide-up">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Notifications</h2>
              {totalUnread > 0 && (
                <Badge variant="destructive" className="min-w-[20px] h-5 text-xs">
                  {totalUnread}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {totalUnread > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  <Check className="w-4 h-4 mr-1" />
                  Tout lire
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-4 mx-6 mt-4">
              <TabsTrigger value="all" className="text-xs">
                Tout {totalUnread > 0 && `(${totalUnread})`}
              </TabsTrigger>
              <TabsTrigger value="message" className="text-xs">
                Messages {getUnreadCount('message') > 0 && `(${getUnreadCount('message')})`}
              </TabsTrigger>
              <TabsTrigger value="favorite" className="text-xs">
                Favoris {getUnreadCount('favorite') > 0 && `(${getUnreadCount('favorite')})`}
              </TabsTrigger>
              <TabsTrigger value="listing" className="text-xs">
                Annonces {getUnreadCount('listing') > 0 && `(${getUnreadCount('listing')})`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="flex-1 mt-0">
              <ScrollArea className="h-full p-0">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-center p-6">
                    <Bell className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Aucune notification</p>
                  </div>
                ) : (
                  <div className="space-y-0">
                    {filteredNotifications.map((notification, index) => {
                      const Icon = getNotificationIcon(notification.type);
                      const iconColor = getNotificationColor(notification.category);
                      
                      return (
                        <div key={notification.id}>
                          <div
                            className={cn(
                              "p-4 cursor-pointer hover:bg-muted/50 transition-colors",
                              !notification.read && "bg-primary/5 border-l-2 border-l-primary"
                            )}
                            onClick={() => {
                              if (!notification.read) {
                                markAsRead(notification.id);
                              }
                              if (notification.action_url) {
                                window.open(notification.action_url, '_blank');
                              }
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <Icon className={cn("w-5 h-5 mt-0.5 flex-shrink-0", iconColor)} />
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className={cn(
                                    "text-sm font-medium leading-tight",
                                    !notification.read && "text-foreground",
                                    notification.read && "text-muted-foreground"
                                  )}>
                                    {notification.title}
                                  </h4>
                                  
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                                  )}
                                </div>
                                
                                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                                  {notification.message}
                                </p>
                                
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(notification.created_at).toLocaleDateString('fr-FR', {
                                      day: 'numeric',
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                  
                                  {notification.action_url && (
                                    <ExternalLink className="w-3 h-3 text-muted-foreground" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {index < filteredNotifications.length - 1 && <Separator />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}