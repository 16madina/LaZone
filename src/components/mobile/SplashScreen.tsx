import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
  minDisplayTime?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ 
  onComplete, 
  minDisplayTime = 2000 
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    
    // Simuler le chargement avec une barre de progression
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // S'assurer que l'écran reste affiché le temps minimum
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(0, minDisplayTime - elapsed);
          
          setTimeout(onComplete, remaining);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onComplete, minDisplayTime]);

  return (
    <div className="fixed inset-0 z-[9999] bg-white dark:bg-background flex flex-col items-center justify-center">
      {/* Logo */}
      <div className="flex flex-col items-center space-y-6 mb-12">
        <div className="relative">
          <div className="w-24 h-24 bg-primary rounded-2xl flex items-center justify-center shadow-xl">
            <span className="text-2xl font-bold text-primary-foreground">LZ</span>
          </div>
          
          {/* Animation de pulsation */}
          <div className="absolute inset-0 w-24 h-24 bg-primary rounded-2xl animate-ping opacity-25"></div>
        </div>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">LaZone</h1>
          <p className="text-muted-foreground text-sm">Immobilier Panafricain</p>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="w-64 h-1 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Indicateur de chargement */}
      <div className="flex items-center space-x-2 mt-8 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Chargement...</span>
      </div>
    </div>
  );
};