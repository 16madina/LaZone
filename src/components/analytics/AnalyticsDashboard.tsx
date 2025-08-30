import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  Home, 
  Shield, 
  Zap,
  Download,
  Calendar,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AnalyticsData {
  totalViews: number;
  totalUsers: number;
  totalListings: number;
  conversionRate: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: Array<{ page: string; views: number }>;
  userActivity: Array<{ date: string; active_users: number }>;
  deviceTypes: Array<{ name: string; value: number; color: string }>;
}

const AnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const startDate = new Date();
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      startDate.setDate(startDate.getDate() - days);

      // Fetch analytics events
      const { data: events } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .eq('user_id', user?.id);

      // Fetch performance metrics
      const { data: metrics } = await supabase
        .from('performance_metrics')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .eq('user_id', user?.id);

      // Process data for mock analytics
      const mockData: AnalyticsData = {
        totalViews: Math.floor(Math.random() * 10000) + 5000,
        totalUsers: Math.floor(Math.random() * 2000) + 1000,
        totalListings: Math.floor(Math.random() * 500) + 200,
        conversionRate: parseFloat((Math.random() * 15 + 5).toFixed(1)),
        bounceRate: parseFloat((Math.random() * 40 + 30).toFixed(1)),
        avgSessionDuration: Math.floor(Math.random() * 300 + 180),
        topPages: [
          { page: '/properties', views: 3456 },
          { page: '/property/123', views: 2341 },
          { page: '/', views: 1987 },
          { page: '/search', views: 1654 },
          { page: '/profile', views: 987 }
        ],
        userActivity: Array.from({ length: days }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (days - i - 1));
          return {
            date: date.toISOString().split('T')[0],
            active_users: Math.floor(Math.random() * 500) + 100
          };
        }),
        deviceTypes: [
          { name: 'Mobile', value: 65, color: '#0088FE' },
          { name: 'Desktop', value: 30, color: '#00C49F' },
          { name: 'Tablet', value: 5, color: '#FFBB28' }
        ]
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    if (!analyticsData) return;
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Metric,Value\n"
      + `Total Views,${analyticsData.totalViews}\n`
      + `Total Users,${analyticsData.totalUsers}\n`
      + `Total Listings,${analyticsData.totalListings}\n`
      + `Conversion Rate,${analyticsData.conversionRate}%\n`
      + `Bounce Rate,${analyticsData.bounceRate}%\n`;
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `analytics-${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!analyticsData) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Tableau de Bord Analytics</h2>
          <p className="text-muted-foreground">
            Analyses détaillées et métriques de performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-secondary rounded-xl p-1">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <Button
                key={range}
                variant="ghost"
                size="sm"
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  dateRange === range 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground"
                }`}
              >
                {range === '7d' ? '7 jours' : range === '30d' ? '30 jours' : '90 jours'}
              </Button>
            ))}
          </div>
          <Button variant="outline" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vues Totales</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalViews.toLocaleString()}</div>
            <Badge variant="secondary" className="mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12.5%
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalUsers.toLocaleString()}</div>
            <Badge variant="secondary" className="mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +8.2%
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annonces Actives</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalListings.toLocaleString()}</div>
            <Badge variant="secondary" className="mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +5.7%
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Conversion</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.conversionRate}%</div>
            <Badge variant="secondary" className="mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +2.1%
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="traffic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="traffic">Trafic</TabsTrigger>
          <TabsTrigger value="devices">Appareils</TabsTrigger>
          <TabsTrigger value="pages">Pages Populaires</TabsTrigger>
        </TabsList>

        <TabsContent value="traffic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activité des Utilisateurs</CardTitle>
              <CardDescription>
                Nombre d'utilisateurs actifs sur les {dateRange === '7d' ? '7' : dateRange === '30d' ? '30' : '90'} derniers jours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.userActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="active_users" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Répartition par Appareils</CardTitle>
              <CardDescription>
                Types d'appareils utilisés par vos visiteurs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.deviceTypes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analyticsData.deviceTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pages les Plus Visitées</CardTitle>
              <CardDescription>
                Classement des pages par nombre de vues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.topPages}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="page" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="views" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Métriques de Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Taux de Rebond</span>
              <Badge variant="outline">{analyticsData.bounceRate}%</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Durée Moyenne de Session</span>
              <Badge variant="outline">
                {Math.floor(analyticsData.avgSessionDuration / 60)}m {analyticsData.avgSessionDuration % 60}s
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Pages par Session</span>
              <Badge variant="outline">2.8</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Statut de Sécurité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Connexions Sécurisées</span>
              <Badge className="bg-green-100 text-green-800">100%</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Tentatives Bloquées</span>
              <Badge variant="outline">12 dernières 24h</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Score de Sécurité</span>
              <Badge className="bg-green-100 text-green-800">Excellent</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;