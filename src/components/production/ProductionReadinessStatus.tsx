import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Shield,
  Code,
  Zap,
  Search,
  Monitor
} from 'lucide-react';

interface ProductionStatus {
  category: string;
  status: 'completed' | 'warning' | 'critical';
  items: Array<{
    name: string;
    status: 'completed' | 'pending' | 'warning';
    description: string;
  }>;
}

const productionStatus: ProductionStatus[] = [
  {
    category: 'Sécurité Critique',
    status: 'warning',
    items: [
      { name: 'Politiques RLS', status: 'completed', description: 'Toutes les tables sont sécurisées' },
      { name: 'Fonctions DB', status: 'completed', description: 'Search path sécurisé' },
      { name: 'Protection mots de passe', status: 'warning', description: 'À activer manuellement' },
      { name: 'Expiration OTP', status: 'warning', description: 'À réduire manuellement' }
    ]
  },
  {
    category: 'Code & Performance',
    status: 'completed',
    items: [
      { name: 'Debug code', status: 'completed', description: 'Console.log supprimés' },
      { name: 'Logging système', status: 'completed', description: 'Logger production créé' },
      { name: 'Optimisation images', status: 'completed', description: 'Composant lazy loading' },
      { name: 'Gestion erreurs', status: 'completed', description: 'Error tracking configuré' }
    ]
  },
  {
    category: 'SEO & Métadonnées',
    status: 'completed',
    items: [
      { name: 'SEO Optimizer', status: 'completed', description: 'Composant créé' },
      { name: 'Meta tags', status: 'completed', description: 'Open Graph configuré' },
      { name: 'Données structurées', status: 'completed', description: 'Schema.org implémenté' },
      { name: 'URLs canoniques', status: 'completed', description: 'Système en place' }
    ]
  },
  {
    category: 'Monitoring',
    status: 'completed',
    items: [
      { name: 'Performance metrics', status: 'completed', description: 'Tracking automatique' },
      { name: 'Sécurité monitoring', status: 'completed', description: 'Dashboard créé' },
      { name: 'Analytics events', status: 'completed', description: 'Système complet' },
      { name: 'Error tracking', status: 'completed', description: 'Logger intégré' }
    ]
  }
];

const ProductionReadinessStatus: React.FC = () => {
  const getStatusIcon = (status: 'completed' | 'warning' | 'critical' | 'pending') => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending': return <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />;
    }
  };

  const getStatusBadge = (status: 'completed' | 'warning' | 'critical') => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-100 text-green-800">Prêt</Badge>;
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">Action requise</Badge>;
      case 'critical': return <Badge className="bg-red-100 text-red-800">Critique</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Sécurité Critique': return <Shield className="w-5 h-5" />;
      case 'Code & Performance': return <Code className="w-5 h-5" />;
      case 'SEO & Métadonnées': return <Search className="w-5 h-5" />;
      case 'Monitoring': return <Monitor className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  const overallStatus = productionStatus.some(cat => cat.status === 'critical') 
    ? 'critical'
    : productionStatus.some(cat => cat.status === 'warning')
    ? 'warning'
    : 'completed';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">État de Production</h2>
          <p className="text-muted-foreground">
            Statut de préparation pour la mise en production
          </p>
        </div>
        {getStatusBadge(overallStatus)}
      </div>

      {/* Overall Status Alert */}
      {overallStatus === 'warning' && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Actions Requises</AlertTitle>
          <AlertDescription className="text-yellow-700">
            Certaines configurations manuelles sont nécessaires avant la mise en production.
            Consultez les sections avec des avertissements ci-dessous.
          </AlertDescription>
        </Alert>
      )}

      {overallStatus === 'completed' && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Application Prête</AlertTitle>
          <AlertDescription className="text-green-700">
            Toutes les vérifications de sécurité et d'optimisation sont complètes.
            L'application est prête pour la production.
          </AlertDescription>
        </Alert>
      )}

      {/* Status Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {productionStatus.map((category) => (
          <Card key={category.category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getCategoryIcon(category.category)}
                {category.category}
                {getStatusBadge(category.status)}
              </CardTitle>
              <CardDescription>
                {category.items.filter(item => item.status === 'completed').length} / {category.items.length} éléments complétés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {category.items.map((item) => (
                  <div key={item.name} className="flex items-start gap-3">
                    {getStatusIcon(item.status)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">{item.name}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Manual Actions Required */}
      {overallStatus === 'warning' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Actions Manuelles Requises
            </CardTitle>
            <CardDescription>
              Ces éléments nécessitent une configuration manuelle dans Supabase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-yellow-400 pl-4">
                <h4 className="font-medium">Protection des Mots de Passe</h4>
                <p className="text-sm text-muted-foreground">
                  Allez dans Supabase Dashboard → Authentication → Settings et activez "Leaked Password Protection"
                </p>
              </div>
              <div className="border-l-4 border-yellow-400 pl-4">
                <h4 className="font-medium">Expiration OTP</h4>
                <p className="text-sm text-muted-foreground">
                  Réduire l'expiration OTP à 5 minutes maximum dans les paramètres d'authentification
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductionReadinessStatus;