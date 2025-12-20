import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Smartphone, Share, MoreVertical, Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { AppLogo } from '@/components/AppLogo';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPage = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const features = [
    { icon: '🏠', title: 'Accès rapide', description: 'Lancez l\'app directement depuis votre écran d\'accueil' },
    { icon: '📴', title: 'Mode hors-ligne', description: 'Consultez vos favoris même sans connexion' },
    { icon: '🔔', title: 'Notifications', description: 'Recevez des alertes pour les nouveaux biens' },
    { icon: '⚡', title: 'Performance', description: 'Chargement ultra-rapide et expérience fluide' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Installer LaZone</h1>
        </div>
      </header>

      <main className="p-4 pb-24 space-y-6">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <div className="w-24 h-24 mx-auto mb-4 rounded-3xl overflow-hidden shadow-xl bg-primary/10 p-2">
            <AppLogo className="w-full h-full object-contain" />
          </div>
          <h2 className="text-2xl font-bold mb-2">LaZone</h2>
          <p className="text-muted-foreground">L'immobilier africain dans votre poche</p>
        </motion.div>

        {/* Install Status */}
        {isInstalled ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="bg-green-500/10 border-green-500/20">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
                  Application installée !
                </h3>
                <p className="text-sm text-muted-foreground">
                  LaZone est maintenant disponible sur votre écran d'accueil
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <>
            {/* Install Button (Android/Desktop with prompt) */}
            {deferredPrompt && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Button 
                  onClick={handleInstall}
                  className="w-full h-14 text-lg gap-3"
                  size="lg"
                >
                  <Download className="w-6 h-6" />
                  Installer l'application
                </Button>
              </motion.div>
            )}

            {/* iOS Instructions */}
            {isIOS && !deferredPrompt && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-primary" />
                      Comment installer sur iPhone/iPad
                    </h3>
                    <ol className="space-y-4">
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center shrink-0">1</span>
                        <div>
                          <p className="font-medium">Appuyez sur le bouton Partager</p>
                          <div className="flex items-center gap-2 mt-1 text-muted-foreground text-sm">
                            <Share className="w-4 h-4" />
                            <span>En bas de l'écran Safari</span>
                          </div>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center shrink-0">2</span>
                        <div>
                          <p className="font-medium">Faites défiler et appuyez sur</p>
                          <p className="mt-1 px-3 py-1.5 bg-muted rounded-lg text-sm inline-block">
                            Sur l'écran d'accueil
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center shrink-0">3</span>
                        <div>
                          <p className="font-medium">Appuyez sur "Ajouter"</p>
                          <p className="text-sm text-muted-foreground mt-1">L'icône LaZone apparaîtra sur votre écran d'accueil</p>
                        </div>
                      </li>
                    </ol>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Android Instructions (fallback) */}
            {isAndroid && !deferredPrompt && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-primary" />
                      Comment installer sur Android
                    </h3>
                    <ol className="space-y-4">
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center shrink-0">1</span>
                        <div>
                          <p className="font-medium">Ouvrez le menu du navigateur</p>
                          <div className="flex items-center gap-2 mt-1 text-muted-foreground text-sm">
                            <MoreVertical className="w-4 h-4" />
                            <span>Les trois points en haut à droite</span>
                          </div>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center shrink-0">2</span>
                        <div>
                          <p className="font-medium">Appuyez sur</p>
                          <p className="mt-1 px-3 py-1.5 bg-muted rounded-lg text-sm inline-block">
                            Installer l'application
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center shrink-0">3</span>
                        <div>
                          <p className="font-medium">Confirmez l'installation</p>
                          <p className="text-sm text-muted-foreground mt-1">L'icône LaZone apparaîtra sur votre écran d'accueil</p>
                        </div>
                      </li>
                    </ol>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </>
        )}

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-semibold mb-4">Pourquoi installer LaZone ?</h3>
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <h4 className="font-medium text-sm mb-1">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* CTA to continue browsing */}
        <div className="pt-4">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate('/')}
          >
            Continuer sur le site
          </Button>
        </div>
      </main>
    </div>
  );
};

export default InstallPage;
