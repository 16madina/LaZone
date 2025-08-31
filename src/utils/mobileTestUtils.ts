// Utilitaires de test des fonctionnalités critiques mobile
interface MobileTestResult {
  feature: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  recommendation?: string;
}

export class MobileFunctionalityTester {
  private results: MobileTestResult[] = [];

  async runAllTests(): Promise<MobileTestResult[]> {
    this.results = [];
    
    await this.testTouchInteractions();
    await this.testViewportHandling();
    await this.testImageLoading();
    await this.testNetworkConnectivity();
    await this.testGeolocation();
    await this.testPerformance();
    await this.testPWAFeatures();
    
    return this.results;
  }

  private addResult(feature: string, status: 'success' | 'warning' | 'error', message: string, recommendation?: string) {
    this.results.push({ feature, status, message, recommendation });
  }

  private async testTouchInteractions(): Promise<void> {
    try {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const touchTest = document.createElement('div');
      touchTest.style.cssText = 'position:fixed;top:0;left:0;width:44px;height:44px;z-index:-1;';
      document.body.appendChild(touchTest);
      
      const rect = touchTest.getBoundingClientRect();
      const minTouchSize = rect.width >= 44 && rect.height >= 44;
      
      document.body.removeChild(touchTest);
      
      if (hasTouch && minTouchSize) {
        this.addResult('Touch Interactions', 'success', 'Interface tactile bien configurée');
      } else if (hasTouch && !minTouchSize) {
        this.addResult('Touch Interactions', 'warning', 'Taille des boutons tactiles insuffisante', 'Augmenter la taille des boutons à minimum 44px');
      } else {
        this.addResult('Touch Interactions', 'success', 'Interface desktop détectée');
      }
    } catch (error) {
      this.addResult('Touch Interactions', 'error', 'Erreur lors du test tactile');
    }
  }

  private async testViewportHandling(): Promise<void> {
    try {
      const viewport = document.querySelector('meta[name="viewport"]');
      const hasViewport = viewport !== null;
      const viewportContent = viewport?.getAttribute('content') || '';
      
      const hasSafeArea = CSS.supports('padding', 'env(safe-area-inset-top)');
      
      if (hasViewport && viewportContent.includes('viewport-fit=cover')) {
        this.addResult('Viewport Configuration', 'success', 'Configuration viewport mobile optimale');
      } else if (hasViewport) {
        this.addResult('Viewport Configuration', 'warning', 'Viewport configuré mais non optimisé pour mobile', 'Ajouter viewport-fit=cover pour les écrans avec encoche');
      } else {
        this.addResult('Viewport Configuration', 'error', 'Meta viewport manquant', 'Ajouter la meta viewport pour mobile');
      }
      
      if (hasSafeArea) {
        this.addResult('Safe Area Support', 'success', 'Support des zones sécurisées iOS');
      } else {
        this.addResult('Safe Area Support', 'warning', 'Support des zones sécurisées limité');
      }
    } catch (error) {
      this.addResult('Viewport Configuration', 'error', 'Erreur lors du test viewport');
    }
  }

  private async testImageLoading(): Promise<void> {
    try {
      const images = document.querySelectorAll('img');
      const lazyImages = Array.from(images).filter(img => img.loading === 'lazy').length;
      const totalImages = images.length;
      
      if (totalImages === 0) {
        this.addResult('Image Loading', 'warning', 'Aucune image détectée');
        return;
      }
      
      const lazyPercentage = (lazyImages / totalImages) * 100;
      
      if (lazyPercentage > 80) {
        this.addResult('Image Loading', 'success', `${lazyPercentage.toFixed(1)}% des images utilisent le lazy loading`);
      } else if (lazyPercentage > 50) {
        this.addResult('Image Loading', 'warning', `Seulement ${lazyPercentage.toFixed(1)}% des images utilisent le lazy loading`, 'Optimiser le chargement différé des images');
      } else {
        this.addResult('Image Loading', 'error', `Lazy loading insuffisant (${lazyPercentage.toFixed(1)}%)`, 'Implémenter le lazy loading pour améliorer les performances');
      }
    } catch (error) {
      this.addResult('Image Loading', 'error', 'Erreur lors du test des images');
    }
  }

  private async testNetworkConnectivity(): Promise<void> {
    try {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      
      if (connection) {
        const effectiveType = connection.effectiveType;
        const saveData = connection.saveData;
        
        if (effectiveType === '4g' && !saveData) {
          this.addResult('Network Connectivity', 'success', 'Connexion rapide détectée');
        } else if (effectiveType === '3g' || saveData) {
          this.addResult('Network Connectivity', 'warning', 'Connexion lente ou mode économie de données', 'Optimisations automatiques activées');
        } else {
          this.addResult('Network Connectivity', 'error', 'Connexion très lente détectée', 'Mode performance dégradé recommandé');
        }
      } else {
        this.addResult('Network Connectivity', 'warning', 'API Network Information non supportée');
      }
    } catch (error) {
      this.addResult('Network Connectivity', 'error', 'Erreur lors du test de connectivité');
    }
  }

  private async testGeolocation(): Promise<void> {
    try {
      if ('geolocation' in navigator) {
        // Test rapide sans demander de permission
        const permissions = await navigator.permissions.query({name: 'geolocation' as PermissionName});
        
        if (permissions.state === 'granted') {
          this.addResult('Geolocation', 'success', 'Géolocalisation autorisée');
        } else if (permissions.state === 'prompt') {
          this.addResult('Geolocation', 'warning', 'Géolocalisation disponible mais non autorisée');
        } else {
          this.addResult('Geolocation', 'error', 'Géolocalisation refusée', 'Encourager l\'utilisateur à autoriser la géolocalisation');
        }
      } else {
        this.addResult('Geolocation', 'error', 'Géolocalisation non supportée');
      }
    } catch (error) {
      this.addResult('Geolocation', 'warning', 'Test géolocalisation limité');
    }
  }

  private async testPerformance(): Promise<void> {
    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = navigation.loadEventEnd - navigation.fetchStart;
      
      if (loadTime < 2000) {
        this.addResult('Performance', 'success', `Temps de chargement rapide: ${loadTime.toFixed(0)}ms`);
      } else if (loadTime < 5000) {
        this.addResult('Performance', 'warning', `Temps de chargement modéré: ${loadTime.toFixed(0)}ms`, 'Optimiser les ressources critiques');
      } else {
        this.addResult('Performance', 'error', `Temps de chargement lent: ${loadTime.toFixed(0)}ms`, 'Optimisation urgente requise');
      }
      
      // Test de la mémoire disponible
      const memory = (performance as any).memory;
      if (memory) {
        const memoryUsage = (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;
        if (memoryUsage < 50) {
          this.addResult('Memory Usage', 'success', `Utilisation mémoire: ${memoryUsage.toFixed(1)}%`);
        } else if (memoryUsage < 80) {
          this.addResult('Memory Usage', 'warning', `Utilisation mémoire élevée: ${memoryUsage.toFixed(1)}%`);
        } else {
          this.addResult('Memory Usage', 'error', `Utilisation mémoire critique: ${memoryUsage.toFixed(1)}%`);
        }
      }
    } catch (error) {
      this.addResult('Performance', 'error', 'Erreur lors du test de performance');
    }
  }

  private async testPWAFeatures(): Promise<void> {
    try {
      // Test du Service Worker
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        if (registrations.length > 0) {
          this.addResult('Service Worker', 'success', 'Service Worker actif');
        } else {
          this.addResult('Service Worker', 'warning', 'Service Worker non enregistré', 'Enregistrer un Service Worker pour le mode hors-ligne');
        }
      } else {
        this.addResult('Service Worker', 'error', 'Service Worker non supporté');
      }
      
      // Test du Manifest
      const manifestLink = document.querySelector('link[rel="manifest"]');
      if (manifestLink) {
        this.addResult('PWA Manifest', 'success', 'Manifest PWA configuré');
      } else {
        this.addResult('PWA Manifest', 'warning', 'Manifest PWA manquant', 'Ajouter un manifest pour l\'installation sur écran d\'accueil');
      }
      
      // Test de l'installation PWA
      if ('BeforeInstallPromptEvent' in window || (window as any).deferredPrompt) {
        this.addResult('PWA Installation', 'success', 'Installation PWA disponible');
      } else {
        this.addResult('PWA Installation', 'warning', 'Installation PWA limitée');
      }
    } catch (error) {
      this.addResult('PWA Features', 'error', 'Erreur lors du test PWA');
    }
  }
}

export const runMobileTests = async (): Promise<MobileTestResult[]> => {
  const tester = new MobileFunctionalityTester();
  return await tester.runAllTests();
};