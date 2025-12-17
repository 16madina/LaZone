import { useState, useEffect } from 'react';
import { useTutorial } from '@/hooks/useTutorial';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { X, Sparkles, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TutorialPrompt = () => {
  const { hasCompletedTutorial, startTutorial, skipTutorial, isActive } = useTutorial();
  const { user } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Show prompt for new users who haven't completed tutorial
    if (!hasCompletedTutorial && !isActive) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setShowPrompt(false);
    }
  }, [hasCompletedTutorial, isActive]);

  const handleStart = () => {
    setShowPrompt(false);
    startTutorial();
  };

  const handleSkip = () => {
    setShowPrompt(false);
    skipTutorial();
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99] bg-black/50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-card rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-border"
        >
          {/* Header illustration */}
          <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-8 flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                <GraduationCap className="w-10 h-10 text-primary" />
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-2 -right-2"
              >
                <Sparkles className="w-6 h-6 text-primary" />
              </motion.div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 text-center">
            <h2 className="text-xl font-bold mb-2">
              Bienvenue sur LaZone ! 🏠
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Découvrez comment utiliser l'application en quelques étapes simples. 
              Le tutoriel ne prend que 2 minutes.
            </p>

            <div className="space-y-3">
              <Button onClick={handleStart} className="w-full gap-2">
                <Sparkles className="w-4 h-4" />
                Commencer le tutoriel
              </Button>
              <Button variant="ghost" onClick={handleSkip} className="w-full">
                Je connais déjà, passer
              </Button>
            </div>
          </div>

          {/* Features preview */}
          <div className="px-6 pb-6">
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { emoji: '🔍', label: 'Recherche' },
                { emoji: '🗺️', label: 'Carte' },
                { emoji: '📝', label: 'Publier' },
                { emoji: '💬', label: 'Messages' },
              ].map((item) => (
                <div key={item.label} className="p-2 bg-muted/50 rounded-lg">
                  <div className="text-lg mb-1">{item.emoji}</div>
                  <div className="text-xs text-muted-foreground">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TutorialPrompt;
