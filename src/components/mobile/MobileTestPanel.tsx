import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { runMobileTests } from '@/utils/mobileTestUtils';

interface TestResult {
  feature: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  recommendation?: string;
}

interface MobileTestPanelProps {
  onClose?: () => void;
}

export const MobileTestPanel: React.FC<MobileTestPanelProps> = ({ onClose }) => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRunTime, setLastRunTime] = useState<Date | null>(null);

  const runTests = async () => {
    setIsRunning(true);
    try {
      const results = await runMobileTests();
      setTestResults(results);
      setLastRunTime(new Date());
    } catch (error) {
      console.error('Erreur lors des tests mobile:', error);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    // Lancer les tests automatiquement au montage
    runTests();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-success text-success-foreground';
      case 'warning':
        return 'bg-warning text-warning-foreground';
      case 'error':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const successCount = testResults.filter(r => r.status === 'success').length;
  const warningCount = testResults.filter(r => r.status === 'warning').length;
  const errorCount = testResults.filter(r => r.status === 'error').length;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Test des Fonctionnalités Mobile</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={runTests}
              disabled={isRunning}
            >
              {isRunning ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              {isRunning ? 'Tests en cours...' : 'Relancer les tests'}
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                Fermer
              </Button>
            )}
          </div>
        </div>
        
        {lastRunTime && (
          <p className="text-sm text-muted-foreground">
            Dernière exécution: {lastRunTime.toLocaleTimeString()}
          </p>
        )}

        {/* Résumé des résultats */}
        {testResults.length > 0 && (
          <div className="flex gap-2 mt-2">
            <Badge className="bg-success text-success-foreground">
              {successCount} réussis
            </Badge>
            {warningCount > 0 && (
              <Badge className="bg-warning text-warning-foreground">
                {warningCount} avertissements
              </Badge>
            )}
            {errorCount > 0 && (
              <Badge className="bg-destructive text-destructive-foreground">
                {errorCount} erreurs
              </Badge>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {isRunning && testResults.length === 0 && (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Exécution des tests en cours...</p>
          </div>
        )}

        {testResults.map((result, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 rounded-lg border bg-card"
          >
            <div className="flex-shrink-0 mt-0.5">
              {getStatusIcon(result.status)}
            </div>
            
            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm">{result.feature}</h4>
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getStatusColor(result.status)}`}
                >
                  {result.status}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground mb-1">
                {result.message}
              </p>
              
              {result.recommendation && (
                <p className="text-xs text-primary bg-primary/10 p-2 rounded border-l-2 border-primary">
                  💡 {result.recommendation}
                </p>
              )}
            </div>
          </div>
        ))}

        {!isRunning && testResults.length === 0 && (
          <div className="text-center py-8">
            <AlertCircle className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Aucun test exécuté</p>
            <Button className="mt-2" onClick={runTests}>
              Lancer les tests
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};