import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, AppMode } from '@/stores/appStore';
import { Home, Building2 } from 'lucide-react';
import logoLazone from '@/assets/logo-lazone.png';

interface ModeSwitchSplashProps {
  targetMode: AppMode;
  onComplete: () => void;
}

export const ModeSwitchSplash = ({ targetMode, onComplete }: ModeSwitchSplashProps) => {
  const isResidence = targetMode === 'residence';
  
  // Auto-complete after animation
  setTimeout(() => {
    onComplete();
  }, 1800);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center"
        style={{
          background: isResidence 
            ? 'linear-gradient(135deg, hsl(160 84% 39%), hsl(158 64% 52%), hsl(162 73% 46%))'
            : 'linear-gradient(135deg, hsl(24 95% 53%), hsl(32 98% 50%), hsl(20 90% 48%))'
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Pulsing Circles */}
        <motion.div
          className="absolute w-64 h-64 rounded-full"
          style={{ 
            background: 'rgba(255,255,255,0.1)',
            filter: 'blur(60px)'
          }}
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Logo/Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.2
            }}
            className="mb-6"
          >
            <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-2xl">
              {isResidence ? (
                <Building2 className="w-12 h-12 text-white" />
              ) : (
                <img src={logoLazone} alt="LaZone" className="w-14 h-14 object-contain" />
              )}
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-bold text-white mb-2 font-display"
          >
            {isResidence ? 'LaZone' : 'LaZone'}
          </motion.h1>
          
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-2xl font-semibold text-white/90 font-display"
          >
            {isResidence ? 'Residence' : 'Immobilier'}
          </motion.span>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-white/70 mt-4 text-sm"
          >
            {isResidence 
              ? 'Courts séjours • Vacances • Expériences'
              : 'Vente • Location • Investissement'
            }
          </motion.p>

          {/* Loading indicator */}
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 120 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-8 h-1 bg-white/30 rounded-full overflow-hidden"
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ 
                duration: 1,
                repeat: 1,
                ease: "easeInOut"
              }}
              className="h-full w-full bg-white rounded-full"
            />
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};