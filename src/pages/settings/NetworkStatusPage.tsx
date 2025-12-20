import { ArrowLeft, Wifi, WifiOff, Signal, Clock, Download, RefreshCw, Database, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const NetworkStatusPage = () => {
  const navigate = useNavigate();
  const { isOnline, connectionType, effectiveType, downlink, rtt, getConnectionQuality, refresh } = useNetworkStatus();
  const [cacheSize, setCacheSize] = useState<string>('Calcul...');
  const [isClearing, setIsClearing] = useState(false);

  const quality = getConnectionQuality();

  const qualityConfig = {
    excellent: { color: 'text-green-500', bg: 'bg-green-500/10', label: 'Excellente', bars: 4 },
    good: { color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Bonne', bars: 3 },
    fair: { color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Moyenne', bars: 2 },
    poor: { color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'Faible', bars: 1 },
    offline: { color: 'text-destructive', bg: 'bg-destructive/10', label: 'Hors ligne', bars: 0 },
  };

  const config = qualityConfig[quality];

  useEffect(() => {
    const calculateCacheSize = async () => {
      try {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
          const estimate = await navigator.storage.estimate();
          const usedMB = ((estimate.usage || 0) / (1024 * 1024)).toFixed(2);
          setCacheSize(`${usedMB} MB`);
        } else {
          setCacheSize('Non disponible');
        }
      } catch {
        setCacheSize('Erreur');
      }
    };
    
    calculateCacheSize();
  }, []);

  const clearCache = async () => {
    setIsClearing(true);
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      localStorage.clear();
      sessionStorage.clear();
      
      toast.success('Cache vidé avec succès');
      setCacheSize('0 MB');
    } catch (error) {
      toast.error('Erreur lors du vidage du cache');
    } finally {
      setIsClearing(false);
    }
  };

  const SignalBars = ({ bars }: { bars: number }) => (
    <div className="flex items-end gap-0.5 h-5">
      {[1, 2, 3, 4].map((bar) => (
        <motion.div
          key={bar}
          className={`w-1.5 rounded-sm ${bars >= bar ? config.color.replace('text-', 'bg-') : 'bg-muted'}`}
          style={{ height: `${bar * 25}%` }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: bar * 0.1 }}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Statut du réseau</h1>
          <Button variant="ghost" size="icon" className="ml-auto" onClick={refresh}>
            <RefreshCw className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Status principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className={`${config.bg} border-none`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {isOnline ? (
                    <div className={`p-3 rounded-full ${config.bg}`}>
                      <Wifi className={`w-8 h-8 ${config.color}`} />
                    </div>
                  ) : (
                    <div className="p-3 rounded-full bg-destructive/10">
                      <WifiOff className="w-8 h-8 text-destructive" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold">{isOnline ? 'Connecté' : 'Hors ligne'}</h2>
                    <p className={`text-sm ${config.color}`}>{config.label}</p>
                  </div>
                </div>
                <SignalBars bars={config.bars} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Détails de connexion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Signal className="w-4 h-4" />
                Détails de connexion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Type de connexion</p>
                  <p className="font-medium capitalize">{connectionType || effectiveType || 'Inconnu'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Qualité réseau</p>
                  <p className="font-medium uppercase">{effectiveType || 'N/A'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Download className="w-3 h-3" />
                    Débit descendant
                  </div>
                  <p className="font-medium">{downlink ? `${downlink} Mbps` : 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    Latence (RTT)
                  </div>
                  <p className="font-medium">{rtt ? `${rtt} ms` : 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mode hors-ligne */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="w-4 h-4" />
                Mode hors-ligne
              </CardTitle>
              <CardDescription>
                Les données mises en cache permettent d'utiliser l'app sans connexion
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">Données en cache</p>
                  <p className="text-sm text-muted-foreground">{cacheSize}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCache}
                  disabled={isClearing}
                >
                  {isClearing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span className="ml-2">Vider</span>
                </Button>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Pages visitées disponibles hors-ligne
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Images des propriétés mises en cache
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500" />
                  Messages synchronisés à la reconnexion
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="pt-4"
        >
          <Button 
            className="w-full" 
            variant="outline"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser la connexion
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default NetworkStatusPage;
