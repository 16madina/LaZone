import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  Bed, 
  Bath, 
  Maximize, 
  MapPin, 
  Phone, 
  MessageCircle,
  Calendar,
  Check
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { properties, favorites, toggleFavorite } = useAppStore();
  
  const property = properties.find(p => p.id === id);
  const isFavorite = favorites.includes(id || '');

  if (!property) {
    return (
      <div className="page-container flex items-center justify-center min-h-screen">
        <div className="glass-card p-8 text-center">
          <p className="text-4xl mb-4">🏠</p>
          <p className="text-muted-foreground">Propriété non trouvée</p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="mt-4 gradient-primary px-6 py-2 rounded-xl text-primary-foreground"
          >
            Retour à l'accueil
          </motion.button>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number, type: 'sale' | 'rent') => {
    if (type === 'rent') {
      return `${price.toLocaleString('fr-CA')} $/mois`;
    }
    return `${price.toLocaleString('fr-CA')} $`;
  };

  return (
    <div className="min-h-screen pb-32">
      {/* Header Image */}
      <div className="relative h-72">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6 }}
          src={property.images[0]}
          alt={property.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        
        {/* Header Actions */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-4 right-4 flex justify-between"
        >
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="glass w-10 h-10 rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="glass w-10 h-10 rounded-full flex items-center justify-center"
            >
              <Share2 className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => toggleFavorite(property.id)}
              className="glass w-10 h-10 rounded-full flex items-center justify-center"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-destructive text-destructive' : ''}`} />
            </motion.button>
          </div>
        </motion.div>

        {/* Type Badge */}
        <div className="absolute bottom-4 left-4">
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
            property.type === 'sale' 
              ? 'gradient-primary text-primary-foreground' 
              : 'bg-secondary text-secondary-foreground'
          }`}>
            {property.type === 'sale' ? 'À vendre' : 'À louer'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 mb-4"
        >
          <h1 className="font-display text-2xl font-bold mb-2">{property.title}</h1>
          <p className="gradient-text font-display font-bold text-3xl mb-3">
            {formatPrice(property.price, property.type)}
          </p>
          
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{property.address}, {property.city}</span>
          </div>

          {property.propertyType !== 'land' && (
            <div className="flex items-center gap-6">
              {property.bedrooms > 0 && (
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl glass">
                    <Bed className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{property.bedrooms}</p>
                    <p className="text-xs text-muted-foreground">Chambres</p>
                  </div>
                </div>
              )}
              {property.bathrooms > 0 && (
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl glass">
                    <Bath className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-semibold">{property.bathrooms}</p>
                    <p className="text-xs text-muted-foreground">S. de bain</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl glass">
                  <Maximize className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold">{property.area}</p>
                  <p className="text-xs text-muted-foreground">m²</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5 mb-4"
        >
          <h3 className="font-display font-semibold mb-3">Description</h3>
          <p className="text-muted-foreground leading-relaxed">{property.description}</p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-5 mb-4"
        >
          <h3 className="font-display font-semibold mb-3">Caractéristiques</h3>
          <div className="grid grid-cols-2 gap-2">
            {property.features.map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Agent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-5 mb-4"
        >
          <h3 className="font-display font-semibold mb-3">Agent immobilier</h3>
          <div className="flex items-center gap-3">
            <img
              src={property.agent.avatar}
              alt={property.agent.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="font-semibold">{property.agent.name}</p>
              <p className="text-sm text-muted-foreground">{property.agent.phone}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Fixed Bottom Actions */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 p-4 glass border-t border-glass-border"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
      >
        <div className="flex gap-3 max-w-lg mx-auto">
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="flex-1 glass-button flex items-center justify-center gap-2"
          >
            <Phone className="w-5 h-5" />
            <span>Appeler</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="flex-1 glass-button flex items-center justify-center gap-2"
          >
            <Calendar className="w-5 h-5" />
            <span>Visite</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="flex-1 gradient-primary rounded-xl py-3 flex items-center justify-center gap-2 text-primary-foreground font-medium"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Message</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default PropertyDetail;
