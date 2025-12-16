import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export const HeroSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl gradient-hero p-6 mb-6"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
            scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
          }}
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary-foreground/20 blur-3xl"
        />
        <motion.div
          animate={{ 
            rotate: -360,
            scale: [1, 1.3, 1],
          }}
          transition={{ 
            rotate: { duration: 25, repeat: Infinity, ease: 'linear' },
            scale: { duration: 5, repeat: Infinity, ease: 'easeInOut' }
          }}
          className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-primary-foreground/20 blur-3xl"
        />
      </div>

      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 mb-3"
        >
          <Sparkles className="w-4 h-4 text-primary-foreground/80" />
          <span className="text-sm text-primary-foreground/80 font-medium">
            Bienvenue sur LaZone
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-display text-3xl font-bold text-primary-foreground mb-2"
        >
          Trouvez la propriété
          <br />
          <span className="text-primary-foreground/90">de vos rêves</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-primary-foreground/70 text-sm"
        >
          Des milliers de propriétés en Afrique de l'Ouest
        </motion.p>
      </div>

      {/* Floating House Icon */}
      <motion.div
        animate={{ y: [-5, 5, -5] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute right-4 bottom-4 text-6xl opacity-30"
      >
        🏠
      </motion.div>
    </motion.div>
  );
};
