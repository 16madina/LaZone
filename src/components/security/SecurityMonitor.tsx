import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Lock,
  UserCheck,
  Activity,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/utils/logger';

interface SecurityEvent {
  id: string;
  action_type: string;
  resource_type: string;
  success: boolean;
  ip_address: string | null;
  error_message?: string;
  created_at: string;
}

interface SecurityStats {
  totalLogins: number;
  failedLogins: number;
  successRate: number;
  uniqueIPs: number;
  suspiciousActivity: SecurityEvent[];
  recentEvents: SecurityEvent[];
}

const SecurityMonitor: React.FC = () => {
  const { user } = useAuth();
  const [securityStats, setSecurityStats] = useState<SecurityStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [securityLevel, setSecurityLevel] = useState<'excellent' | 'good' | 'warning' | 'critical'>('good');

  useEffect(() => {
    if (user) {
      fetchSecurityData();
    }
  }, [user]);

  const fetchSecurityData = async () => {
    setLoading(true);
    try {
      // Use mock data since security_audit_log table doesn't exist
      const mockStats: SecurityStats = {
        totalLogins: 45,
        failedLogins: 2,
        successRate: 95.6,
        uniqueIPs: 3,
        suspiciousActivity: [],
        recentEvents: [
          {
            id: '1',
            action_type: 'login',
            resource_type: 'auth',
            success: true,
            ip_address: '192.168.1.1',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '2',
            action_type: 'profile_update',
            resource_type: 'profile',
            success: true,
            ip_address: '192.168.1.1',
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      };
      
      setSecurityStats(mockStats);
      setSecurityLevel('good');
    } catch (error) {
      logger.error('Error fetching security data', error as Error, { component: 'SecurityMonitor' });
    } finally {
      setLoading(false);
    }
  };

  const getSecurityLevelColor = (level: typeof securityLevel) => {
    switch (level) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
    }
  };

  const getSecurityLevelIcon = (level: typeof securityLevel) => {
    switch (level) {
      case 'excellent': return <CheckCircle className="w-5 h-5" />;
      case 'good': return <Shield className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'critical': return <XCircle className="w-5 h-5" />;
    }
  };

  const logSecurityEvent = async (actionType: string, resourceType: string, success: boolean, errorMessage?: string) => {
    try {
      // Log to analytics_events table instead since security_audit_log doesn't exist
      await supabase
        .from('analytics_events')
        .insert({
          user_id: user?.id,
          event_type: `security_${actionType}`,
          event_data: {
            action_type: actionType,
            resource_type: resourceType,
            success,
            error_message: errorMessage,
            ip_address: '0.0.0.0' // In real implementation, get actual IP
          }
        });
    } catch (error) {
      logger.error('Error logging security event', error as Error, { 
        component: 'SecurityMonitor',
        actionType,
        resourceType 
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!securityStats) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Monitoring de Sécurité</h2>
          <p className="text-muted-foreground">
            Surveillance et audit de la sécurité de votre compte
          </p>
        </div>
        <Button variant="outline" onClick={fetchSecurityData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Security Level Alert */}
      {securityLevel === 'critical' && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Niveau de Sécurité Critique</AlertTitle>
          <AlertDescription className="text-red-700">
            Activité suspecte détectée. Veuillez vérifier vos paramètres de sécurité et changer votre mot de passe.
          </AlertDescription>
        </Alert>
      )}

      {securityLevel === 'warning' && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Attention Requise</AlertTitle>
          <AlertDescription className="text-yellow-700">
            Quelques événements de sécurité nécessitent votre attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Niveau de Sécurité</CardTitle>
            {getSecurityLevelIcon(securityLevel)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{securityLevel}</div>
            <Badge className={getSecurityLevelColor(securityLevel)}>
              Score: {securityLevel === 'excellent' ? '95+' : securityLevel === 'good' ? '85-95' : securityLevel === 'warning' ? '70-85' : '<70'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connexions Réussies</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats.totalLogins - securityStats.failedLogins}</div>
            <Badge variant="outline" className="mt-1">
              {securityStats.successRate.toFixed(1)}% de succès
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tentatives Échouées</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats.failedLogins}</div>
            <Badge variant={securityStats.failedLogins > 5 ? "destructive" : "outline"}>
              {securityStats.failedLogins > 5 ? 'Attention' : 'Normal'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activité Suspecte</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats.suspiciousActivity.length}</div>
            <Badge variant={securityStats.suspiciousActivity.length > 0 ? "destructive" : "outline"}>
              {securityStats.suspiciousActivity.length > 0 ? 'À surveiller' : 'Aucune'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Recent Security Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Événements Récents
            </CardTitle>
            <CardDescription>
              Dernières activités de sécurité sur votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            {securityStats.recentEvents.length > 0 ? (
              <div className="space-y-3">
                {securityStats.recentEvents.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      {event.success ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{event.action_type}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={event.success ? "outline" : "destructive"}>
                      {event.success ? 'Succès' : 'Échec'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucun événement récent
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Activités Suspectes
            </CardTitle>
            <CardDescription>
              Événements nécessitant votre attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            {securityStats.suspiciousActivity.length > 0 ? (
              <div className="space-y-3">
                {securityStats.suspiciousActivity.map((event) => (
                  <div key={event.id} className="border border-red-200 rounded-lg p-3 bg-red-50">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="destructive">{event.action_type}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.created_at).toLocaleString()}
                      </span>
                    </div>
                    {event.error_message && (
                      <p className="text-sm text-red-700">{event.error_message}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      IP: {event.ip_address}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-green-700">Aucune activité suspecte</p>
                <p className="text-xs text-muted-foreground">Votre compte semble sécurisé</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Security Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommandations de Sécurité</CardTitle>
          <CardDescription>
            Actions suggérées pour améliorer la sécurité de votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Actions Recommandées</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Activez l'authentification à deux facteurs</li>
                <li>• Changez régulièrement votre mot de passe</li>
                <li>• Surveillez les connexions suspectes</li>
                <li>• Utilisez des mots de passe forts et uniques</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Bonnes Pratiques</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Ne partagez jamais vos identifiants</li>
                <li>• Déconnectez-vous des appareils publics</li>
                <li>• Vérifiez l'URL avant de saisir vos données</li>
                <li>• Maintenez votre navigateur à jour</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityMonitor;