import { useEffect, useState, useRef } from 'react';
import { useTutorial } from '@/hooks/useTutorial';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Sparkles, ArrowDown, ArrowUp, ArrowLeft, ArrowRight } from 'lucide-react';
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
        // Auto-scroll to bring element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Wait a bit for scroll to complete before measuring
        setTimeout(() => {
          const rect = element.getBoundingClientRect();
          setTargetRect(rect);
        }, 300);
      } else {
        setTargetRect(null);
      }
    };

    findTarget();
    
    // Only update position on window resize, not continuously
    const handleResize = () => {
      const element = document.querySelector(step.target!);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  if (!isActive || !step) return null;

  const getTooltipPosition = () => {
    const padding = 16;

    const vv = window.visualViewport;
    const vw = vv?.width ?? window.innerWidth;
    const vh = vv?.height ?? window.innerHeight;

    const tooltipWidth = Math.min(280, vw - padding * 2);
    const availableHeight = Math.max(0, vh - padding * 2);
    const effectiveHeight = Math.min(tooltipHeight || 240, availableHeight);

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

    // Special position for map page - centered at 55% of screen height
    const mapCentered = {
      position: 'fixed' as const,
      top: vh * 0.55,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'auto',
      maxWidth: `${tooltipWidth}px`,
      maxHeight: `${availableHeight}px`,
    };

    const base = {
      maxWidth: `calc(100vw - ${padding * 2}px)`,
      width: `${tooltipWidth}px`,
      maxHeight: `${availableHeight}px`,
    };

    if (step.position === 'map-center') {
      return mapCentered;
    }

    if (!targetRect || step.position === 'center') {
      return centered;
    }

    switch (step.position) {
      case 'top':
        return {
          position: 'fixed' as const,
          top: Math.max(padding, targetRect.top - effectiveHeight - padding - 30),
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
          top: Math.min(targetRect.bottom + padding + 30, vh - effectiveHeight - padding),
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
          left: Math.max(padding, targetRect.left - tooltipWidth - padding - 30),
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
          left: Math.min(targetRect.right + padding + 30, vw - tooltipWidth - padding),
          ...base,
        };
      default:
        return centered;
    }
  };

  // Get arrow position and direction
  const getArrowProps = () => {
    if (!targetRect || step.position === 'center') return null;

    const arrowSize = 24;
    
    switch (step.position) {
      case 'top':
        return {
          Icon: ArrowDown,
          style: {
            position: 'fixed' as const,
            top: targetRect.top - arrowSize - 8,
            left: targetRect.left + targetRect.width / 2 - arrowSize / 2,
          }
        };
      case 'bottom':
        return {
          Icon: ArrowUp,
          style: {
            position: 'fixed' as const,
            top: targetRect.bottom + 8,
            left: targetRect.left + targetRect.width / 2 - arrowSize / 2,
          }
        };
      case 'left':
        return {
          Icon: ArrowRight,
          style: {
            position: 'fixed' as const,
            top: targetRect.top + targetRect.height / 2 - arrowSize / 2,
            left: targetRect.left - arrowSize - 8,
          }
        };
      case 'right':
        return {
          Icon: ArrowLeft,
          style: {
            position: 'fixed' as const,
            top: targetRect.top + targetRect.height / 2 - arrowSize / 2,
            left: targetRect.right + 8,
          }
        };
      default:
        return null;
    }
  };

  const arrowProps = getArrowProps();

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

        {/* Animated Arrow pointing to target */}
        {arrowProps && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: step.position === 'top' ? [0, 8, 0] : step.position === 'bottom' ? [0, -8, 0] : 0,
              x: step.position === 'left' ? [0, 8, 0] : step.position === 'right' ? [0, -8, 0] : 0,
            }}
            transition={{ 
              opacity: { duration: 0.3 },
              scale: { duration: 0.3 },
              y: { duration: 1, repeat: Infinity, ease: "easeInOut" },
              x: { duration: 1, repeat: Infinity, ease: "easeInOut" },
            }}
            className="z-[101] pointer-events-none"
            style={arrowProps.style}
          >
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg">
              <arrowProps.Icon className="w-6 h-6 text-primary-foreground" />
            </div>
          </motion.div>
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
          <div className="p-3 pb-1 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">
                {currentStep + 1}/{steps.length}
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
          <div className="px-3 pb-2 flex-1 min-h-0 overflow-y-auto">
            <h3 className="text-base font-semibold mb-1">{step.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Actions */}
          <div className="px-3 pb-3 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="gap-1 h-8 text-xs"
            >
              <ChevronLeft className="w-3 h-3" />
              Préc.
            </Button>
            
            <Button
              size="sm"
              onClick={nextStep}
              className="gap-1 h-8 text-xs"
            >
              {currentStep === steps.length - 1 ? 'OK' : 'Suiv.'}
              {currentStep < steps.length - 1 && <ChevronRight className="w-3 h-3" />}
            </Button>
          </div>

          {/* Skip link */}
          {currentStep < steps.length - 1 && (
            <div className="px-3 pb-2 pt-0 text-center">
              <button
                onClick={skipTutorial}
                className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                Passer
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TutorialOverlay;
