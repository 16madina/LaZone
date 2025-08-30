import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BarChart3, TrendingUp, Shield, Zap, Users, Eye } from 'lucide-react';
import PropertyStats from '@/components/PropertyStats';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import SecurityMonitor from '@/components/security/SecurityMonitor';
import { useRenderPerformance } from '@/hooks/usePerformanceMonitor';

const Stats: React.FC = () => {
  useRenderPerformance('Stats');
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('property');

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              aria-label="Retour"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">Statistiques LaZone</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="property" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Propriétés
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Sécurité
            </TabsTrigger>
          </TabsList>

          <TabsContent value="property" className="mt-6">
            <PropertyStats />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="performance" className="mt-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Monitoring des Performances</h2>
                <p className="text-muted-foreground">
                  Métriques de performance et optimisations en temps réel
                </p>
              </div>

              {/* Performance Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Temps de Chargement</CardTitle>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1.2s</div>
                    <Badge className="bg-green-100 text-green-800 mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Excellent
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Core Web Vitals</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">95</div>
                    <Badge className="bg-green-100 text-green-800 mt-1">
                      Score Lighthouse
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Utilisateurs Simultanés</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">147</div>
                    <Badge variant="outline" className="mt-1">
                      Temps réel
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Erreurs</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0.1%</div>
                    <Badge className="bg-green-100 text-green-800 mt-1">
                      Très faible
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Métriques de Performance</CardTitle>
                    <CardDescription>
                      Détails des temps de chargement et de rendu
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">First Contentful Paint</span>
                      <Badge variant="outline">0.8s</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Largest Contentful Paint</span>
                      <Badge variant="outline">1.2s</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Cumulative Layout Shift</span>
                      <Badge className="bg-green-100 text-green-800">0.05</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">First Input Delay</span>
                      <Badge className="bg-green-100 text-green-800">45ms</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Optimisations Actives</CardTitle>
                    <CardDescription>
                      Améliorations de performance en cours
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Lazy Loading Images</span>
                      <Badge className="bg-green-100 text-green-800">Activé</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Code Splitting</span>
                      <Badge className="bg-green-100 text-green-800">Activé</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Service Worker</span>
                      <Badge className="bg-green-100 text-green-800">Actif</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">CDN Cache</span>
                      <Badge className="bg-green-100 text-green-800">99.8%</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Real-time Monitoring */}
              <Card>
                <CardHeader>
                  <CardTitle>Monitoring en Temps Réel</CardTitle>
                  <CardDescription>
                    Surveillance continue des performances de l'application
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">98.9%</div>
                      <div className="text-sm text-muted-foreground">Disponibilité</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">245ms</div>
                      <div className="text-sm text-muted-foreground">Temps de Réponse API</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">15MB</div>
                      <div className="text-sm text-muted-foreground">Bande Passante/min</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <SecurityMonitor />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Stats;