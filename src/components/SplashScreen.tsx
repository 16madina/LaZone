import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [phase, setPhase] = useState<'logo' | 'text' | 'exit'>('logo');

  useEffect(() => {
    // Phase 1: Logo animation (0-1s)
    const textTimer = setTimeout(() => setPhase('text'), 800);
    // Phase 2: Text animation (1-2s), then exit
    const exitTimer = setTimeout(() => setPhase('exit'), 2200);
    // Complete and unmount
    const completeTimer = setTimeout(() => onComplete(), 2800);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'exit' ? (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-primary via-orange-500 to-orange-600"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.1 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: '40px 40px',
              }}
            />
          </div>

          {/* Animated circles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0.3 }}
                animate={{ scale: 4, opacity: 0 }}
                transition={{
                  duration: 2,
                  delay: i * 0.4,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-white/30"
              />
            ))}
          </div>

          {/* Logo container */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 20,
              duration: 0.8,
            }}
            className="relative z-10"
          >
            {/* Glow effect */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 0.5, 0.3], scale: [0.8, 1.2, 1] }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="absolute inset-0 blur-3xl bg-white/40 rounded-full"
            />
            
            {/* Logo - Enlarged */}
            <motion.img
              src="/images/logo-lazone.png"
              alt="LaZone"
              className="w-44 h-44 object-contain relative z-10 drop-shadow-2xl"
              initial={{ filter: 'brightness(0) invert(1)' }}
              animate={{ filter: 'brightness(1) invert(0)' }}
              transition={{ duration: 0.5, delay: 0.3 }}
            />
          </motion.div>

          {/* Slogan */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 relative z-10 px-8"
          >
            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6, ease: 'easeOut' }}
              className="text-center text-white text-xl font-medium leading-relaxed"
            >
              Trouvez votre chez vous dans votre Zone
            </motion.p>
          </motion.div>

          {/* Loading indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="absolute bottom-20 flex flex-col items-center gap-4"
          >
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="w-2.5 h-2.5 rounded-full bg-white"
                />
              ))}
            </div>
          </motion.div>

          {/* Bottom decoration */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1, duration: 1, ease: 'easeInOut' }}
            className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 origin-left"
          />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] bg-gradient-to-br from-primary via-orange-500 to-orange-600"
        />
      )}
    </AnimatePresence>
  );
};