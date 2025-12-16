import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
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
  Check,
  Loader2,
  Flag,
  Ban,
  ChevronRight as ChevronRightIcon,
  Plus
} from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { ImageGallery } from '@/components/property/ImageGallery';
import { ReportDialog } from '@/components/property/ReportDialog';
import { supabase } from '@/integrations/supabase/client';
import { formatPriceWithCurrency } from '@/data/currencies';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface PropertyDetail {
  id: string;
  title: string;
  price: number;
  type: 'sale' | 'rent';
  propertyType: 'house' | 'apartment' | 'land' | 'commercial';
  address: string;
  city: string;
  country: string | null;
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: string[];
  description: string;
  features: string[];
  userId: string;
  whatsappEnabled: boolean;
}

interface OtherProperty {
  id: string;
  title: string;
  price: number;
  country: string | null;
  image: string;
}

const PropertyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [showGallery, setShowGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [ownerInfo, setOwnerInfo] = useState<{ full_name: string | null; phone: string | null; avatar_url: string | null } | null>(null);
  const [ownerListingsCount, setOwnerListingsCount] = useState(0);
  const [otherProperties, setOtherProperties] = useState<OtherProperty[]>([]);
  
  const favorite = isFavorite(id || '');

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Fetch property with images
        const { data: propertyData, error: propertyError } = await supabase
          .from('properties')
          .select(`
            *,
            property_images (
              url,
              is_primary,
              display_order
            )
          `)
          .eq('id', id)
          .maybeSingle();

        if (propertyError) throw propertyError;
        
        if (!propertyData) {
          setProperty(null);
          setLoading(false);
          return;
        }

        // Sort images: primary first, then by display_order
        const sortedImages = (propertyData.property_images || [])
          .sort((a: any, b: any) => {
            if (a.is_primary && !b.is_primary) return -1;
            if (!a.is_primary && b.is_primary) return 1;
            return (a.display_order || 0) - (b.display_order || 0);
          })
          .map((img: any) => img.url);

        const formattedProperty: PropertyDetail = {
          id: propertyData.id,
          title: propertyData.title,
          price: Number(propertyData.price),
          type: propertyData.type as 'sale' | 'rent',
          propertyType: propertyData.property_type as 'house' | 'apartment' | 'land' | 'commercial',
          address: propertyData.address,
          city: propertyData.city,
          country: propertyData.country,
          bedrooms: propertyData.bedrooms || 0,
          bathrooms: propertyData.bathrooms || 0,
          area: Number(propertyData.area),
          images: sortedImages.length > 0 ? sortedImages : ['/placeholder.svg'],
          description: propertyData.description || '',
          features: propertyData.features || [],
          userId: propertyData.user_id,
          whatsappEnabled: propertyData.whatsapp_enabled || false,
        };

        setProperty(formattedProperty);

        // Fetch owner info
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, phone, avatar_url')
          .eq('user_id', propertyData.user_id)
          .maybeSingle();

        if (profileData) {
          setOwnerInfo(profileData);
        }

        // Fetch owner's listings count
        const { count } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', propertyData.user_id)
          .eq('is_active', true);

        setOwnerListingsCount(count || 0);

        // Fetch other properties from same owner
        const { data: otherProps } = await supabase
          .from('properties')
          .select(`
            id,
            title,
            price,
            country,
            property_images (url, is_primary)
          `)
          .eq('user_id', propertyData.user_id)
          .eq('is_active', true)
          .neq('id', id)
          .limit(5);

        if (otherProps) {
          setOtherProperties(otherProps.map((p: any) => ({
            id: p.id,
            title: p.title,
            price: p.price,
            country: p.country,
            image: p.property_images?.find((img: any) => img.is_primary)?.url || p.property_images?.[0]?.url || '/placeholder.svg'
          })));
        }
      } catch (err) {
        console.error('Error fetching property:', err);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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

  const formatPrice = (price: number, type: 'sale' | 'rent', country: string | null) => {
    const formattedPrice = formatPriceWithCurrency(price, country);
    if (type === 'rent') {
      return `${formattedPrice}/mois`;
    }
    return formattedPrice;
  };

  const formatShortPrice = (price: number, country: string | null) => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(0)}B FCFA`;
    } else if (price >= 1000000) {
      return `${(price / 1000000).toFixed(0)}M FCFA`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K FCFA`;
    }
    return formatPriceWithCurrency(price, country);
  };

  const maxThumbnails = 4;
  const hasMoreImages = property.images.length > maxThumbnails;
  const visibleThumbnails = hasMoreImages ? property.images.slice(0, maxThumbnails) : property.images;
  const remainingCount = property.images.length - maxThumbnails;

  const handleWhatsAppContact = () => {
    if (ownerInfo?.phone) {
      const phone = ownerInfo.phone.replace(/\s/g, '').replace(/^\+/, '');
      const message = encodeURIComponent(`Bonjour, je suis intéressé par votre annonce "${property.title}"`);
      window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    }
  };

  const handleCall = () => {
    if (ownerInfo?.phone) {
      window.location.href = `tel:${ownerInfo.phone}`;
    } else {
      toast({
        title: 'Numéro non disponible',
        description: 'Le vendeur n\'a pas renseigné son numéro de téléphone.',
        variant: 'destructive',
      });
    }
  };

  const handleContactSeller = () => {
    if (!user) {
      toast({
        title: 'Connexion requise',
        description: 'Veuillez vous connecter pour contacter le vendeur.',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }
    // Navigate to messages with this property context
    navigate('/messages', { state: { propertyId: property.id, ownerId: property.userId } });
    toast({
      title: 'Messagerie',
      description: 'Fonctionnalité de messagerie en cours de développement.',
    });
  };

  const handleScheduleVisit = () => {
    if (!user) {
      toast({
        title: 'Connexion requise',
        description: 'Veuillez vous connecter pour prendre rendez-vous.',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }
    toast({
      title: 'Demande envoyée',
      description: 'Votre demande de visite a été envoyée au vendeur.',
    });
  };

  return (
    <div className="min-h-screen pb-32">
      {/* Header Image Carousel */}
      <div className="relative h-80">
        <Swiper
          modules={[Pagination]}
          spaceBetween={0}
          slidesPerView={1}
          onSlideChange={(swiper) => setCurrentImageIndex(swiper.activeIndex)}
          className="h-full"
        >
          {property.images.map((img, idx) => (
            <SwiperSlide key={idx}>
              <img
                src={img}
                alt={`${property.title} - ${idx + 1}`}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setShowGallery(true)}
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
        
        {/* Header Actions */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-4 right-4 flex justify-between z-10"
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
              <Heart className={`w-5 h-5 ${favorite ? 'fill-destructive text-destructive' : ''}`} />
            </motion.button>
          </div>
        </motion.div>

        {/* Thumbnails */}
        {property.images.length > 1 && (
          <div className="absolute bottom-4 left-4 flex gap-1.5 z-20">
            {visibleThumbnails.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all shadow-lg ${
                  idx === currentImageIndex 
                    ? 'border-primary' 
                    : 'border-white/50'
                }`}
              >
                <img 
                  src={img} 
                  alt="" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              </button>
            ))}
            {hasMoreImages && (
              <button
                onClick={() => setShowGallery(true)}
                className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white/50 relative shadow-lg"
              >
                <img 
                  src={property.images[maxThumbnails]} 
                  alt="" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm flex items-center">
                    <Plus className="w-3 h-3" />{remainingCount}
                  </span>
                </div>
              </button>
            )}
          </div>
        )}

        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 glass px-3 py-1.5 rounded-full text-sm font-medium z-20">
          {currentImageIndex + 1}/{property.images.length}
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
            {formatPrice(property.price, property.type, property.country)}
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
        {property.description && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-5 mb-4"
          >
            <h3 className="font-display font-semibold mb-3">Description</h3>
            <p className="text-muted-foreground leading-relaxed">{property.description}</p>
          </motion.div>
        )}

        {/* Features & Documents */}
        {property.features.length > 0 && (() => {
          // Separate amenities from documents
          const documentLabels = [
            'ACD (Attestation de Cession de Droits)',
            'Titre Foncier',
            'Permis de construire',
            'Certificat d\'urbanisme',
            'Plan cadastral',
            'Attestation de propriété'
          ];
          
          const amenities = property.features.filter(f => !documentLabels.includes(f));
          const documents = property.features.filter(f => documentLabels.includes(f));
          
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-5 mb-4"
            >
              <div className="grid grid-cols-2 gap-6">
                {/* Amenities Column */}
                {amenities.length > 0 && (
                  <div>
                    <h3 className="font-display font-semibold mb-3">Caractéristiques</h3>
                    <div className="space-y-2">
                      {amenities.map((feature) => (
                        <div key={feature} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Documents Column */}
                {documents.length > 0 && (
                  <div>
                    <h3 className="font-display font-semibold mb-3">Documents</h3>
                    <div className="space-y-2">
                      {documents.map((doc) => (
                        <div key={doc} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="text-sm">{doc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })()}

        {/* Owner/Agent Section */}
        {ownerInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-5 mb-4"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={ownerInfo.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'}
                  alt={ownerInfo.full_name || 'Propriétaire'}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop';
                  }}
                />
                <div>
                  <p className="font-semibold">{ownerInfo.full_name || 'Propriétaire'}</p>
                  <p className="text-sm text-muted-foreground">{ownerListingsCount} annonce{ownerListingsCount > 1 ? 's' : ''}</p>
                </div>
              </div>
              <button className="px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors">
                Voir profil
              </button>
            </div>

            {/* Contact Buttons */}
            <div className="space-y-3">
              <button 
                onClick={handleContactSeller}
                className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-medium flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Contacter le vendeur
              </button>
              
              <button 
                onClick={handleScheduleVisit}
                className="w-full py-3 rounded-xl border border-border hover:bg-muted transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Prendre rendez-vous pour une visite
              </button>
              
              <button 
                onClick={handleCall}
                className="w-full py-3 rounded-xl border border-border hover:bg-muted transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                Appeler le vendeur
              </button>
              
              {property.whatsappEnabled && ownerInfo?.phone && (
                <button 
                  onClick={handleWhatsAppContact}
                  className="w-full py-3 rounded-xl border border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Contacter via WhatsApp
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Report and Block Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-8 py-4 mb-4"
        >
          <ReportDialog 
            propertyId={property.id} 
            trigger={
              <button className="flex items-center gap-2 text-destructive hover:text-destructive/80 transition-colors">
                <Flag className="w-4 h-4" />
                <span className="text-sm font-medium">Signaler l'annonce</span>
              </button>
            }
          />
          <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <Ban className="w-4 h-4" />
            <span className="text-sm font-medium">Bloquer</span>
          </button>
        </motion.div>

        {/* Other Properties from Same Owner */}
        {otherProperties.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold">Autres annonces</h3>
              <button className="text-primary text-sm font-medium flex items-center gap-1">
                Voir tout
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
              {otherProperties.map((prop) => (
                <button
                  key={prop.id}
                  onClick={() => navigate(`/property/${prop.id}`)}
                  className="flex-shrink-0 w-28"
                >
                  <div className="w-28 h-20 rounded-xl overflow-hidden mb-2">
                    <img 
                      src={prop.image} 
                      alt={prop.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  <p className="text-xs font-medium truncate">{prop.title}</p>
                  <p className="text-xs text-primary font-semibold">{formatShortPrice(prop.price, prop.country)}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Image Gallery Modal */}
      <AnimatePresence>
        {showGallery && (
          <ImageGallery
            images={property.images}
            initialIndex={currentImageIndex}
            onClose={() => setShowGallery(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PropertyDetailPage;
