import React, { useState, useEffect } from 'react';
import { TrendingUp, Eye, MessageSquare, Star, Users, Building, Calendar, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AgentStats {
  totalListings: number;
  activeListings: number;
  totalViews: number;
  totalMessages: number;
  averageRating: number;
  totalReviews: number;
  monthlyListings: number;
  conversionRate: number;
}

interface RecentActivity {
  id: string;
  type: 'listing_view' | 'message' | 'review' | 'listing_created';
  title: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

const AgentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AgentStats>({
    totalListings: 0,
    activeListings: 0,
    totalViews: 0,
    totalMessages: 0,
    averageRating: 0,
    totalReviews: 0,
    monthlyListings: 0,
    conversionRate: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [topListings, setTopListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchAgentData();
  }, [user]);

  const fetchAgentData = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Fetch user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Fetch listings stats
      const { data: listings } = await supabase
        .from('listings')
        .select('id, title, price, currency, status, created_at, purpose')
        .eq('user_id', user.id);

      // Fetch conversations
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id, created_at')
        .eq('seller_id', user.id);

      // Fetch messages
      const { data: messages } = await supabase
        .from('messages')
        .select('id, created_at')
        .in('conversation_id', conversations?.map(c => c.id) || []);

      // Calculate stats
      const totalListings = listings?.length || 0;
      const activeListings = listings?.filter(l => l.status === 'active').length || 0;
      const monthlyListings = listings?.filter(l => {
        const created = new Date(l.created_at);
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return created > monthAgo;
      }).length || 0;

      setStats({
        totalListings,
        activeListings,
        totalViews: Math.floor(Math.random() * 1000) + 100, // Simulated
        totalMessages: messages?.length || 0,
        averageRating: profile?.agent_rating || 0,
        totalReviews: profile?.total_reviews || 0,
        monthlyListings,
        conversionRate: activeListings > 0 ? Math.round((conversations?.length || 0) / activeListings * 100) : 0
      });

      // Set top listings (most recent active ones)
      setTopListings(
        listings
          ?.filter(l => l.status === 'active')
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5) || []
      );

      // Generate recent activity (simulated)
      const activities: RecentActivity[] = [
        ...listings?.slice(0, 3).map(listing => ({
          id: `listing-${listing.id}`,
          type: 'listing_created' as const,
          title: 'Nouvelle annonce publiée',
          description: listing.title,
          timestamp: listing.created_at
        })) || [],
        ...messages?.slice(0, 3).map(message => ({
          id: `message-${message.id}`,
          type: 'message' as const,
          title: 'Nouveau message reçu',
          description: 'Un client s\'intéresse à votre propriété',
          timestamp: message.created_at
        })) || []
      ];

      setRecentActivity(
        activities
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 10)
      );

    } catch (error) {
      console.error('Error fetching agent data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'listing_view': return <Eye className="w-4 h-4 text-blue-500" />;
      case 'message': return <MessageSquare className="w-4 h-4 text-green-500" />;
      case 'review': return <Star className="w-4 h-4 text-yellow-500" />;
      case 'listing_created': return <Building className="w-4 h-4 text-purple-500" />;
      default: return <Calendar className="w-4 h-4 text-gray-500" />;
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord agent</h1>
          <p className="text-muted-foreground">
            Gérez vos annonces et suivez vos performances
          </p>
        </div>
        <Badge variant={stats.averageRating >= 4 ? "default" : "secondary"} className="px-3 py-1">
          <Award className="w-4 h-4 mr-1" />
          {stats.averageRating >= 4 ? 'Agent Vérifié' : 'Agent'}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annonces actives</CardTitle>
            <Building className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeListings}</div>
            <p className="text-xs text-muted-foreground">
              Sur {stats.totalListings} au total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vues totales</CardTitle>
            <Eye className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews}</div>
            <p className="text-xs text-muted-foreground">
              Ce mois-ci
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages reçus</CardTitle>
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMessages}</div>
            <p className="text-xs text-muted-foreground">
              Taux de conversion {stats.conversionRate}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Note moyenne</CardTitle>
            <Star className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '--'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalReviews} avis
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Objectifs du mois
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Nouvelles annonces</span>
              <span>{stats.monthlyListings}/10</span>
            </div>
            <Progress value={(stats.monthlyListings / 10) * 100} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Messages traités</span>
              <span>{Math.min(stats.totalMessages, 50)}/50</span>
            </div>
            <Progress value={(Math.min(stats.totalMessages, 50) / 50) * 100} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Note client</span>
              <span>{stats.averageRating.toFixed(1)}/5.0</span>
            </div>
            <Progress value={(stats.averageRating / 5) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Activité récente</TabsTrigger>
          <TabsTrigger value="listings">Mes annonces</TabsTrigger>
          <TabsTrigger value="analytics">Analytiques</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Aucune activité récente
                </p>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{activity.title}</h4>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(activity.timestamp).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="listings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mes meilleures annonces</CardTitle>
            </CardHeader>
            <CardContent>
              {topListings.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Aucune annonce active
                </p>
              ) : (
                <div className="space-y-4">
                  {topListings.map((listing) => (
                    <div key={listing.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{listing.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {listing.price.toLocaleString()} {listing.currency} - {listing.purpose === 'buy' ? 'Vente' : 'Location'}
                        </p>
                      </div>
                      <Badge variant={listing.status === 'active' ? 'default' : 'secondary'}>
                        {listing.status === 'active' ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytiques détaillées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.conversionRate}%</div>
                  <p className="text-sm text-muted-foreground">Taux de conversion</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.totalViews > 0 ? Math.round(stats.totalViews / Math.max(stats.activeListings, 1)) : 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Vues par annonce</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{stats.monthlyListings}</div>
                  <p className="text-sm text-muted-foreground">Nouvelles annonces ce mois</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.totalReviews > 0 ? stats.averageRating.toFixed(1) : '--'}
                  </div>
                  <p className="text-sm text-muted-foreground">Satisfaction client</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentDashboard;