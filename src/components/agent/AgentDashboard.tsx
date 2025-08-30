import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Eye, 
  MessageCircle, 
  Star, 
  Building2, 
  Users, 
  Calendar,
  Phone,
  Mail,
  MapPin,
  Award,
  Target,
  BarChart3,
  Activity,
  CheckCircle,
  Clock,
  DollarSign,
  Home
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/utils/currency';

interface AgentStats {
  total_listings: number;
  active_listings: number;
  total_views: number;
  total_inquiries: number;
  conversion_rate: number;
  avg_response_time: number;
  rating: number;
  total_reviews: number;
}

interface Listing {
  id: string;
  title: string;
  price: number;
  currency: string;
  status: string;
  created_at: string;
  views?: number;
  inquiries?: number;
}

export function AgentDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Récupérer les annonces de l'agent
      const { data: listingsData, error: listingsError } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (listingsError) throw listingsError;
      setListings(listingsData || []);

      // Calculer les statistiques
      const activeListings = (listingsData || []).filter(l => l.status === 'active').length;
      const totalViews = Math.floor(Math.random() * 1000) + 200; // Simulation
      const totalInquiries = Math.floor(Math.random() * 50) + 10; // Simulation
      
      const mockStats: AgentStats = {
        total_listings: (listingsData || []).length,
        active_listings: activeListings,
        total_views: totalViews,
        total_inquiries: totalInquiries,
        conversion_rate: totalViews > 0 ? (totalInquiries / totalViews) * 100 : 0,
        avg_response_time: Math.floor(Math.random() * 60) + 15, // Simulation
        rating: 4.2 + Math.random() * 0.8, // Simulation
        total_reviews: Math.floor(Math.random() * 20) + 5 // Simulation
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données du tableau de bord',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tableau de bord Agent</h1>
          <p className="text-muted-foreground">Gérez vos annonces et analysez vos performances</p>
        </div>
        <Badge variant="outline" className="text-blue-600 border-blue-200">
          <Award className="w-3 h-3 mr-1" />
          Agent Certifié
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats?.total_listings || 0}</p>
                <p className="text-xs text-muted-foreground">Total annonces</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats?.total_views || 0}</p>
                <p className="text-xs text-muted-foreground">Vues totales</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{stats?.total_inquiries || 0}</p>
                <p className="text-xs text-muted-foreground">Demandes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{stats?.rating?.toFixed(1) || '0.0'}</p>
                <p className="text-xs text-muted-foreground">Note moyenne</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="listings">Mes annonces</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Métriques de performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Taux de conversion</span>
                    <span className="text-sm text-muted-foreground">
                      {stats?.conversion_rate?.toFixed(1) || 0}%
                    </span>
                  </div>
                  <Progress value={stats?.conversion_rate || 0} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Temps de réponse moyen</span>
                    <span className="text-sm text-muted-foreground">
                      {stats?.avg_response_time || 0} min
                    </span>
                  </div>
                  <Progress value={Math.min((stats?.avg_response_time || 0) / 60 * 100, 100)} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Satisfaction client</span>
                    <span className="text-sm text-muted-foreground">
                      {((stats?.rating || 0) / 5 * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={(stats?.rating || 0) / 5 * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Activité récente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm">Nouvelle demande d'information</p>
                      <p className="text-xs text-muted-foreground">Il y a 2 heures</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm">Annonce vue 15 fois</p>
                      <p className="text-xs text-muted-foreground">Il y a 4 heures</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm">Nouvelle évaluation reçue</p>
                      <p className="text-xs text-muted-foreground">Hier</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <Home className="w-5 h-5" />
                  <span className="text-sm">Nouvelle annonce</span>
                </Button>
                
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm">Messages</span>
                </Button>
                
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <Calendar className="w-5 h-5" />
                  <span className="text-sm">Rendez-vous</span>
                </Button>
                
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <BarChart3 className="w-5 h-5" />
                  <span className="text-sm">Rapports</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="listings" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Mes annonces ({listings.length})</h3>
            <Button>
              <Home className="w-4 h-4 mr-2" />
              Nouvelle annonce
            </Button>
          </div>

          <div className="grid gap-4">
            {listings.map((listing) => (
              <Card key={listing.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{listing.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(listing.price, listing.currency)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Créé le {new Date(listing.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Eye className="w-3 h-3" />
                          <span>{Math.floor(Math.random() * 100) + 10}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MessageCircle className="w-3 h-3" />
                          <span>{Math.floor(Math.random() * 10) + 1}</span>
                        </div>
                      </div>
                      
                      <Badge 
                        variant={listing.status === 'active' ? 'default' : 'secondary'}
                      >
                        {listing.status === 'active' ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Statistiques détaillées</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between py-2 border-b">
                  <span>Annonces publiées ce mois</span>
                  <span className="font-medium">{Math.floor(Math.random() * 10) + 2}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b">
                  <span>Vues moyennes par annonce</span>
                  <span className="font-medium">{Math.floor((stats?.total_views || 0) / Math.max(stats?.total_listings || 1, 1))}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b">
                  <span>Demandes converties</span>
                  <span className="font-medium">{Math.floor(Math.random() * 5) + 1}</span>
                </div>
                
                <div className="flex justify-between py-2">
                  <span>Revenus estimés ce mois</span>
                  <span className="font-medium text-green-600">
                    {Math.floor(Math.random() * 500000) + 100000} CFA
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Objectifs du mois</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Nouvelles annonces</span>
                    <span className="text-sm text-muted-foreground">3/5</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Temps de réponse</span>
                    <span className="text-sm text-muted-foreground">&lt; 30 min</span>
                  </div>
                  <Progress value={80} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Satisfaction client</span>
                    <span className="text-sm text-muted-foreground">4.2/5.0</span>
                  </div>
                  <Progress value={84} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}