import React, { useState } from 'react';
import { Bell, MessageCircle, Calendar, Home, Settings, Check, Trash2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  user_id: string;
  type: 'message' | 'visit_request' | 'listing_update' | 'system';
  title: string;
  content: string;
  read: boolean;
  action_url?: string;
  created_at: string;
  metadata?: any;
}

interface NotificationSettings {
  email_messages: boolean;
  email_visit_requests: boolean;
  email_listing_updates: boolean;
  push_messages: boolean;
  push_visit_requests: boolean;
  push_listing_updates: boolean;
}

export function NotificationCenter() {
  const { toast } = useToast();
  
  // Données factices pour la démonstration
  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      user_id: 'user-1',
      type: 'message',
      title: 'Nouveau message',
      content: 'Jean Dupont vous a envoyé un message concernant votre propriété',
      read: false,
      created_at: '2024-01-10T14:30:00Z'
    },
    {
      id: '2',
      user_id: 'user-1',
      type: 'visit_request',
      title: 'Demande de visite',
      content: 'Marie Kone souhaite visiter votre villa à Cocody',
      read: false,
      created_at: '2024-01-09T10:15:00Z'
    },
    {
      id: '3',
      user_id: 'user-1',
      type: 'listing_update',
      title: 'Annonce mise à jour',
      content: 'Votre annonce "Appartement 3 pièces" a été mise à jour avec succès',
      read: true,
      created_at: '2024-01-08T16:45:00Z'
    }
  ]);
  
  const [settings, setSettings] = useState<NotificationSettings>({
    email_messages: true,
    email_visit_requests: true,
    email_listing_updates: true,
    push_messages: true,
    push_visit_requests: true,
    push_listing_updates: true,
  });
  
  const [filter, setFilter] = useState<'all' | 'unread'>('all');


  const markAsRead = (notificationId: string) => {
    // Dans une vraie application, ceci mettrait à jour la base de données
    toast({
      title: 'Succès',
      description: 'Notification marquée comme lue'
    });
  };

  const markAllAsRead = () => {
    toast({
      title: 'Succès',
      description: 'Toutes les notifications ont été marquées comme lues'
    });
  };

  const deleteNotification = (notificationId: string) => {
    toast({
      title: 'Succès',
      description: 'Notification supprimée'
    });
  };

  const updateSettings = (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    toast({
      title: 'Paramètres mis à jour',
      description: 'Vos préférences de notification ont été sauvegardées'
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="w-4 h-4" />;
      case 'visit_request':
        return <Calendar className="w-4 h-4" />;
      case 'listing_update':
        return <Home className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'message':
        return 'text-blue-500';
      case 'visit_request':
        return 'text-green-500';
      case 'listing_update':
        return 'text-orange-500';
      default:
        return 'text-gray-500';
    }
  };

  const filteredNotifications = notifications.filter(notif => 
    filter === 'all' || (filter === 'unread' && !notif.read)
  );

  const unreadCount = notifications.filter(n => !n.read).length;


  return (
    <Tabs defaultValue="notifications" className="space-y-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="notifications" className="flex items-center gap-2">
          <Bell className="w-4 h-4" />
          Notifications
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-1 text-xs">
              {unreadCount}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Paramètres
        </TabsTrigger>
      </TabsList>

      <TabsContent value="notifications" className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications récentes
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
                  className="flex items-center gap-1"
                >
                  <Filter className="w-4 h-4" />
                  {filter === 'all' ? 'Toutes' : 'Non lues'}
                </Button>
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={markAllAsRead}
                    className="flex items-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    Tout marquer comme lu
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Bell className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {filter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
                  </h3>
                  <p className="text-muted-foreground text-center">
                    {filter === 'unread' 
                      ? 'Toutes vos notifications ont été lues'
                      : 'Vos notifications apparaîtront ici'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 border rounded-lg transition-colors",
                        notification.read ? "bg-muted/30" : "bg-gradient-card border-primary/20"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={cn(
                            "p-2 rounded-full bg-muted",
                            getNotificationColor(notification.type)
                          )}>
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={cn(
                                "text-sm font-medium",
                                !notification.read && "font-semibold"
                              )}>
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary rounded-full" />
                              )}
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.content}
                            </p>
                            
                            <span className="text-xs text-muted-foreground">
                              {new Date(notification.created_at).toLocaleString('fr-FR')}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="settings" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Paramètres de notification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="text-lg font-medium mb-4">Notifications par email</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-messages">Nouveaux messages</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir un email pour les nouveaux messages
                    </p>
                  </div>
                  <Switch
                    id="email-messages"
                    checked={settings.email_messages}
                    onCheckedChange={(checked) => updateSettings('email_messages', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-visits">Demandes de visite</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir un email pour les demandes de visite
                    </p>
                  </div>
                  <Switch
                    id="email-visits"
                    checked={settings.email_visit_requests}
                    onCheckedChange={(checked) => updateSettings('email_visit_requests', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-listings">Mises à jour des annonces</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir un email pour les mises à jour d'annonces
                    </p>
                  </div>
                  <Switch
                    id="email-listings"
                    checked={settings.email_listing_updates}
                    onCheckedChange={(checked) => updateSettings('email_listing_updates', checked)}
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="text-lg font-medium mb-4">Notifications push</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-messages">Nouveaux messages</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir une notification push pour les nouveaux messages
                    </p>
                  </div>
                  <Switch
                    id="push-messages"
                    checked={settings.push_messages}
                    onCheckedChange={(checked) => updateSettings('push_messages', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-visits">Demandes de visite</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir une notification push pour les demandes de visite
                    </p>
                  </div>
                  <Switch
                    id="push-visits"
                    checked={settings.push_visit_requests}
                    onCheckedChange={(checked) => updateSettings('push_visit_requests', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-listings">Mises à jour des annonces</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir une notification push pour les mises à jour d'annonces
                    </p>
                  </div>
                  <Switch
                    id="push-listings"
                    checked={settings.push_listing_updates}
                    onCheckedChange={(checked) => updateSettings('push_listing_updates', checked)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}