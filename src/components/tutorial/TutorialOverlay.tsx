import { useEffect, useState, useRef } from 'react';
import { useTutorial } from '@/hooks/useTutorial';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TutorialOverlay = () => {
  const { isActive, currentStep, steps, nextStep, prevStep, skipTutorial } = useTutorial();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  useEffect(() => {
    if (!isActive || !step?.target) {
      setTargetRect(null);
      return;
    }

    const findTarget = () => {
      const element = document.querySelector(step.target!);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
      } else {
        setTargetRect(null);
      }
    };

    findTarget();
    const interval = setInterval(findTarget, 500);
    
    return () => clearInterval(interval);
  }, [isActive, step, currentStep]);

  if (!isActive) return null;

  const getTooltipPosition = () => {
    if (!targetRect || step.position === 'center') {
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const padding = 16;
    const tooltipWidth = 320;
    const tooltipHeight = 200;

    switch (step.position) {
      case 'top':
        return {
          position: 'fixed' as const,
          top: Math.max(padding, targetRect.top - tooltipHeight - padding),
          left: Math.min(
            Math.max(padding, targetRect.left + targetRect.width / 2 - tooltipWidth / 2),
            window.innerWidth - tooltipWidth - padding
          ),
        };
      case 'bottom':
        return {
          position: 'fixed' as const,
          top: Math.min(targetRect.bottom + padding, window.innerHeight - tooltipHeight - padding),
          left: Math.min(
            Math.max(padding, targetRect.left + targetRect.width / 2 - tooltipWidth / 2),
            window.innerWidth - tooltipWidth - padding
          ),
        };
      case 'left':
        return {
          position: 'fixed' as const,
          top: targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
          left: Math.max(padding, targetRect.left - tooltipWidth - padding),
        };
      case 'right':
        return {
          position: 'fixed' as const,
          top: targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
          left: Math.min(targetRect.right + padding, window.innerWidth - tooltipWidth - padding),
        };
      default:
        return {
          position: 'fixed' as const,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }
  };

  return (
    <AnimatePresence>
      <div ref={overlayRef} className="fixed inset-0 z-[100]">
        {/* Backdrop with spotlight effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70"
        />

        {/* Spotlight on target element */}
        {targetRect && step.position !== 'center' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bg-transparent"
            style={{
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
              borderRadius: '12px',
              border: '2px solid hsl(var(--primary))',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Tutorial Card */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="bg-card rounded-2xl shadow-2xl w-[320px] overflow-hidden border border-border"
          style={getTooltipPosition()}
        >
          {/* Progress bar */}
          <div className="h-1 bg-muted">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Header */}
          <div className="p-4 pb-2 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">
                Étape {currentStep + 1}/{steps.length}
              </span>
            </div>
            <button
              onClick={skipTutorial}
              className="p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Content */}
          <div className="px-4 pb-4">
            <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Actions */}
          <div className="px-4 pb-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Précédent
            </Button>
            
            <Button
              size="sm"
              onClick={nextStep}
              className="gap-1"
            >
              {currentStep === steps.length - 1 ? 'Terminer' : 'Suivant'}
              {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>

          {/* Skip link */}
          {currentStep < steps.length - 1 && (
            <div className="px-4 pb-4 pt-0 text-center">
              <button
                onClick={skipTutorial}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Passer le tutoriel
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TutorialOverlay;
