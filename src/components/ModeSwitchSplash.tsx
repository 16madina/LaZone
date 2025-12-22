import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { AppMode } from '@/stores/appStore';
import { getSoundInstance } from '@/hooks/useSound';
import logoLazone from '@/assets/logo-lazone.png';

interface ModeSwitchSplashProps {
  targetMode: AppMode;
  onComplete: () => void;
}

export const ModeSwitchSplash = ({ targetMode, onComplete }: ModeSwitchSplashProps) => {
  const isResidence = targetMode === 'residence';
  
  // Play stamp sound when stamp animation starts
  useEffect(() => {
    const stampTimer = setTimeout(() => {
      const sound = getSoundInstance();
      sound.playStampSound();
    }, 700); // Sync with stamp animation delay

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2200);

    return () => {
      clearTimeout(stampTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

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
          {/* Logo Container with Stamp Effect */}
          <div className="relative mb-6">
            {/* Main Logo */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.2
              }}
            >
              <div className="w-28 h-28 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-2xl overflow-hidden">
                <img 
                  src={logoLazone} 
                  alt="LaZone" 
                  className="w-16 h-16 object-contain"
                />
              </div>
            </motion.div>

            {/* Stamp on Logo */}
            <motion.div
              initial={{ 
                scale: 3, 
                opacity: 0,
                rotate: isResidence ? -25 : 20
              }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                rotate: isResidence ? -12 : 8
              }}
              transition={{ 
                delay: 0.7,
                type: "spring",
                stiffness: 400,
                damping: 12,
              }}
              className={`absolute -bottom-3 ${isResidence ? '-right-4' : '-left-4'}`}
            >
              {/* Stamp Container */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="relative"
              >
                {/* Stamp Impact Effect */}
                <motion.div
                  initial={{ scale: 1.5, opacity: 0.8 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  transition={{ 
                    delay: 0.7,
                    duration: 0.4,
                    ease: "easeOut"
                  }}
                  className="absolute inset-0 bg-white/30 rounded-lg blur-md"
                />
                
                {/* The Stamp */}
                <div 
                  className="relative px-3 py-1.5 border-2 border-white rounded-md bg-white/10 backdrop-blur-sm"
                  style={{
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)'
                  }}
                >
                  <span 
                    className="text-white font-bold text-xs tracking-wider uppercase"
                    style={{
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                    }}
                  >
                    {isResidence ? 'Residence' : 'Immo'}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-bold text-white mb-2 font-display"
          >
            LaZone
          </motion.h1>
          
          {/* Subtitle with Stamp Animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="relative"
          >
            <motion.div
              initial={{ scale: 2.5, opacity: 0, rotate: isResidence ? -8 : 6 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ 
                delay: 0.9,
                type: "spring",
                stiffness: 350,
                damping: 15,
              }}
              className="relative"
            >
              {/* Stamp Impact Ripple */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0.6 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ 
                  delay: 0.9,
                  duration: 0.5,
                  ease: "easeOut"
                }}
                className="absolute inset-0 bg-white/40 rounded-lg blur-lg"
              />
              
              <span 
                className="text-2xl font-bold text-white font-display px-4 py-1 border-2 border-white/80 rounded-md inline-block"
                style={{
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}
              >
                {isResidence ? 'Residence' : 'Immobilier'}
              </span>
            </motion.div>
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
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
            transition={{ delay: 1.2, duration: 0.8 }}
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