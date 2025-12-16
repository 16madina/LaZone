import { motion } from 'framer-motion';
import { Camera, MapPin, Home, DollarSign, Upload, Plus } from 'lucide-react';

const PublishPage = () => {
  return (
    <div className="page-container">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="font-display text-2xl font-bold">Publier une annonce</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Vendez ou louez votre propriété
        </p>
      </motion.header>

      {/* Photo Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-4 mb-4"
      >
        <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
          <Camera className="w-5 h-5 text-primary" />
          Photos
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <Plus className="w-6 h-6" />
            <span className="text-xs">Ajouter</span>
          </motion.button>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="aspect-square rounded-xl bg-muted/50 flex items-center justify-center"
            >
              <Upload className="w-5 h-5 text-muted-foreground/50" />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Property Type */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-4 mb-4"
      >
        <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
          <Home className="w-5 h-5 text-primary" />
          Type de propriété
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: '🏠', label: 'Maison' },
            { icon: '🏢', label: 'Appartement' },
            { icon: '🌳', label: 'Terrain' },
            { icon: '🏪', label: 'Commercial' },
          ].map((type) => (
            <motion.button
              key={type.label}
              whileTap={{ scale: 0.95 }}
              className="glass-button flex items-center gap-2 justify-center"
            >
              <span>{type.icon}</span>
              <span className="font-medium">{type.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Transaction Type */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card p-4 mb-4"
      >
        <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          Type de transaction
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="glass-button gradient-primary text-primary-foreground"
          >
            À vendre
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="glass-button"
          >
            À louer
          </motion.button>
        </div>
      </motion.div>

      {/* Location */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-4 mb-4"
      >
        <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Localisation
        </h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Adresse"
            className="w-full glass rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Ville"
              className="glass rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50"
            />
            <input
              type="text"
              placeholder="Code postal"
              className="glass rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
      </motion.div>

      {/* Price */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="glass-card p-4 mb-6"
      >
        <h3 className="font-display font-semibold mb-3">Prix</h3>
        <div className="relative">
          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="number"
            placeholder="0"
            className="w-full glass rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 text-xl font-display font-bold"
          />
        </div>
      </motion.div>

      {/* Submit Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        whileTap={{ scale: 0.98 }}
        whileHover={{ scale: 1.02 }}
        className="w-full gradient-primary py-4 rounded-2xl text-primary-foreground font-display font-semibold text-lg shadow-lg"
      >
        Publier l'annonce
      </motion.button>
    </div>
  );
};

export default PublishPage;
