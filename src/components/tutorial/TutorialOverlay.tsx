import { useEffect, useState, useRef } from 'react';
import { useTutorial } from '@/hooks/useTutorial';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TutorialOverlay = () => {
  const { isActive, currentStep, steps, nextStep, prevStep, skipTutorial } = useTutorial();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipHeight, setTooltipHeight] = useState<number>(240);
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!isActive) return;

    const measure = () => {
      const h = cardRef.current?.getBoundingClientRect().height;
      if (typeof h === 'number' && Number.isFinite(h) && h > 0) {
        setTooltipHeight(h);
      }
    };

    measure();

    const vv = window.visualViewport;
    window.addEventListener('resize', measure);
    vv?.addEventListener('resize', measure);

    return () => {
      window.removeEventListener('resize', measure);
      vv?.removeEventListener('resize', measure);
    };
  }, [isActive, currentStep]);

  if (!isActive) return null;

  const getTooltipPosition = () => {
    const padding = 16;

    const vv = window.visualViewport;
    const vw = vv?.width ?? window.innerWidth;
    const vh = vv?.height ?? window.innerHeight;

    const tooltipWidth = Math.min(280, vw - padding * 2);
    const availableHeight = Math.max(0, vh - padding * 2);
    const effectiveHeight = Math.min(tooltipHeight || 240, availableHeight);

    // IMPORTANT: don't use `transform` for centering here.
    // Framer Motion animates transforms (scale/y), which would override our transform and break centering on mobile.
    const centered = {
      position: 'fixed' as const,
      top: padding,
      left: padding,
      right: padding,
      marginLeft: 'auto',
      marginRight: 'auto',
      width: 'auto',
      maxWidth: `${tooltipWidth}px`,
      maxHeight: `${availableHeight}px`,
    };

    const base = {
      maxWidth: `calc(100vw - ${padding * 2}px)`,
      width: `${tooltipWidth}px`,
      maxHeight: `${availableHeight}px`,
    };

    if (!targetRect || step.position === 'center') {
      return centered;
    }

    switch (step.position) {
      case 'top':
        return {
          position: 'fixed' as const,
          top: Math.max(padding, targetRect.top - effectiveHeight - padding),
          left: Math.max(
            padding,
            Math.min(
              targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
              vw - tooltipWidth - padding
            )
          ),
          ...base,
        };
      case 'bottom':
        return {
          position: 'fixed' as const,
          top: Math.min(targetRect.bottom + padding, vh - effectiveHeight - padding),
          left: Math.max(
            padding,
            Math.min(
              targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
              vw - tooltipWidth - padding
            )
          ),
          ...base,
        };
      case 'left':
        return {
          position: 'fixed' as const,
          top: Math.max(
            padding,
            Math.min(
              targetRect.top + targetRect.height / 2 - effectiveHeight / 2,
              vh - effectiveHeight - padding
            )
          ),
          left: Math.max(padding, targetRect.left - tooltipWidth - padding),
          ...base,
        };
      case 'right':
        return {
          position: 'fixed' as const,
          top: Math.max(
            padding,
            Math.min(
              targetRect.top + targetRect.height / 2 - effectiveHeight / 2,
              vh - effectiveHeight - padding
            )
          ),
          left: Math.min(targetRect.right + padding, vw - tooltipWidth - padding),
          ...base,
        };
      default:
        return centered;
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
          className="absolute inset-0 bg-black/40"
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
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.4)',
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
          className="bg-card rounded-2xl shadow-2xl border border-border flex flex-col min-h-0 overflow-hidden"
          style={getTooltipPosition()}
          ref={cardRef}
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
          <div className="px-4 pb-4 flex-1 min-h-0 overflow-y-auto">
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
