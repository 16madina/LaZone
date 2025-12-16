import { motion } from 'framer-motion';
import { MapPin, Filter, List } from 'lucide-react';

const MapPage = () => {
  return (
    <div className="page-container">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <h1 className="font-display text-2xl font-bold">Carte</h1>
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="icon-button"
          >
            <Filter className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="icon-button"
          >
            <List className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card aspect-[3/4] flex flex-col items-center justify-center relative overflow-hidden"
      >
        {/* Placeholder Map Background */}
        <div className="absolute inset-0 gradient-secondary opacity-50" />
        
        {/* Animated Markers */}
        <motion.div
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute top-1/4 left-1/3"
        >
          <div className="gradient-primary p-2 rounded-full">
            <MapPin className="w-4 h-4 text-primary-foreground" />
          </div>
        </motion.div>
        
        <motion.div
          animate={{ y: [5, -5, 5] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="absolute top-1/2 right-1/4"
        >
          <div className="bg-secondary p-2 rounded-full">
            <MapPin className="w-4 h-4 text-secondary-foreground" />
          </div>
        </motion.div>
        
        <motion.div
          animate={{ y: [-3, 3, -3] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="absolute bottom-1/3 left-1/2"
        >
          <div className="bg-accent p-2 rounded-full">
            <MapPin className="w-4 h-4 text-accent-foreground" />
          </div>
        </motion.div>

        <div className="relative z-10 text-center p-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="text-6xl mb-4"
          >
            🗺️
          </motion.div>
          <h3 className="font-display text-xl font-semibold mb-2">
            Carte Interactive
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            Explorez les propriétés sur la carte avec Mapbox
          </p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            className="gradient-primary px-6 py-3 rounded-xl text-primary-foreground font-medium"
          >
            Activer la carte
          </motion.button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-3 gap-3 mt-6"
      >
        <div className="glass-card p-4 text-center">
          <p className="font-display font-bold text-lg gradient-text">125</p>
          <p className="text-xs text-muted-foreground">Montréal</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="font-display font-bold text-lg gradient-text">48</p>
          <p className="text-xs text-muted-foreground">Laval</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="font-display font-bold text-lg gradient-text">32</p>
          <p className="text-xs text-muted-foreground">Longueuil</p>
        </div>
      </motion.div>
    </div>
  );
};

export default MapPage;
