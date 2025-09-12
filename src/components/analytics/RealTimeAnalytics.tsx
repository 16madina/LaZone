import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Activity, Users, Eye, Clock, AlertTriangle, TrendingUp, Globe, Smartphone } from 'lucide-react';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AnalyticsData {
  pageViews: number;
  activeUsers: number;
  avgLoadTime: number;
  errorRate: number;
  bounceRate: number;
  conversionRate: number;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: string;
}

interface UserEngagement {
  time: string;
  users: number;
  pageViews: number;
  interactions: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export function RealTimeAnalytics() {
  const { user } = useAuth();
  const { trackMetric } = usePerformanceMonitor();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    pageViews: 0,
    activeUsers: 0,
    avgLoadTime: 0,
    errorRate: 0,
    bounceRate: 0,
    conversionRate: 0
  });
  const [performanceData, setPerformanceData] = useState<PerformanceMetric[]>([]);
  const [engagementData, setEngagementData] = useState<UserEngagement[]>([]);
  const [deviceData, setDeviceData] = useState([
    { name: 'Desktop', value: 45, color: COLORS[0] },
    { name: 'Mobile', value: 40, color: COLORS[1] },
    { name: 'Tablet', value: 15, color: COLORS[2] }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
    setupRealTimeUpdates();
    
    // Track this analytics page view
    trackMetric({
      name: 'analytics_page_view',
      value: 1,
      unit: 'count'
    });
  }, [user, trackMetric]);

  const fetchAnalyticsData = async () => {
    try {
      // Simulate real-time analytics data
      const mockAnalytics: AnalyticsData = {
        pageViews: Math.floor(Math.random() * 1000) + 500,
        activeUsers: Math.floor(Math.random() * 50) + 20,
        avgLoadTime: Math.random() * 1000 + 500,
        errorRate: Math.random() * 5,
        bounceRate: Math.random() * 30 + 20,
        conversionRate: Math.random() * 10 + 5
      };

      // Generate mock performance data
      const mockPerformanceData: PerformanceMetric[] = Array.from({ length: 24 }, (_, i) => ({
        name: 'page_load_time',
        value: Math.random() * 1000 + 500,
        unit: 'ms',
        timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString()
      }));

      // Generate mock engagement data
      const mockEngagementData: UserEngagement[] = Array.from({ length: 24 }, (_, i) => ({
        time: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toLocaleTimeString('fr-FR', { hour: '2-digit' }),
        users: Math.floor(Math.random() * 30) + 10,
        pageViews: Math.floor(Math.random() * 100) + 50,
        interactions: Math.floor(Math.random() * 50) + 20
      }));

      setAnalytics(mockAnalytics);
      setPerformanceData(mockPerformanceData);
      setEngagementData(mockEngagementData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  const setupRealTimeUpdates = () => {
    // Update analytics every 30 seconds
    const interval = setInterval(() => {
      setAnalytics(prev => ({
        ...prev,
        pageViews: prev.pageViews + Math.floor(Math.random() * 5),
        activeUsers: Math.max(1, prev.activeUsers + Math.floor(Math.random() * 3) - 1),
        avgLoadTime: Math.random() * 1000 + 500,
        errorRate: Math.max(0, Math.random() * 5)
      }));

      // Update engagement data
      setEngagementData(prev => {
        const newData = [...prev.slice(1)];
        newData.push({
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit' }),
          users: Math.floor(Math.random() * 30) + 10,
          pageViews: Math.floor(Math.random() * 100) + 50,
          interactions: Math.floor(Math.random() * 50) + 20
        });
        return newData;
      });
    }, 30000);

    return () => clearInterval(interval);
  };

  const getPerformanceStatus = (value: number, threshold: number) => {
    if (value <= threshold * 0.7) return { status: 'good', color: 'text-green-600' };
    if (value <= threshold) return { status: 'warning', color: 'text-yellow-600' };
    return { status: 'critical', color: 'text-red-600' };
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
      {/* Real-time Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeUsers}</div>
            <div className="flex items-center text-xs text-green-600">
              <Activity className="mr-1 h-3 w-3" />
              En temps réel
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vues de page</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.pageViews.toLocaleString()}</div>
            <Badge variant="secondary" className="text-xs">Aujourd'hui</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps de chargement</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(analytics.avgLoadTime)}ms</div>
            <div className={`text-xs ${getPerformanceStatus(analytics.avgLoadTime, 1000).color}`}>
              {getPerformanceStatus(analytics.avgLoadTime, 1000).status === 'good' ? 'Excellent' : 
               getPerformanceStatus(analytics.avgLoadTime, 1000).status === 'warning' ? 'Correct' : 'Lent'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'erreur</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.errorRate.toFixed(1)}%</div>
            <Progress 
              value={analytics.errorRate} 
              className="mt-2"
              max={10}
            />
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="engagement" className="space-y-4">
        <TabsList>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="devices">Appareils</TabsTrigger>
        </TabsList>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Engagement utilisateur (24h)
              </CardTitle>
              <CardDescription>
                Évolution de l'activité des utilisateurs par heure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Utilisateurs"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pageViews" 
                    stroke="hsl(var(--secondary))" 
                    strokeWidth={2}
                    name="Vues de page"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="interactions" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={2}
                    name="Interactions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Performance (24h)
              </CardTitle>
              <CardDescription>
                Temps de chargement des pages par heure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData.map((item, index) => ({
                  time: new Date(item.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit' }),
                  loadTime: Math.round(item.value)
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}ms`, 'Temps de chargement']} />
                  <Bar 
                    dataKey="loadTime" 
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Répartition par appareil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Métriques clés
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Taux de rebond</span>
                    <span className="text-sm font-medium">{analytics.bounceRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={analytics.bounceRate} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Taux de conversion</span>
                    <span className="text-sm font-medium">{analytics.conversionRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={analytics.conversionRate} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Taux d'erreur</span>
                    <span className="text-sm font-medium">{analytics.errorRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={analytics.errorRate} className="h-2" max={10} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}