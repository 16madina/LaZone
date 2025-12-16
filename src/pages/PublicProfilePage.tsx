import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, BadgeCheck, MapPin, Calendar, 
  Building2, Star, MessageCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PropertyCard } from '@/components/property/PropertyCard';
import { useAuth } from '@/hooks/useAuth';
import { africanCountries } from '@/data/africanCountries';
import { Property } from '@/hooks/useProperties';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  email_verified: boolean | null;
  country: string | null;
  created_at: string;
}

const PublicProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [propertiesLoading, setPropertiesLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchProfile();
      fetchUserProperties();
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images(url, is_primary, display_order)
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform to Property interface
      const transformedProperties: Property[] = (data || []).map((p: any) => {
        const sortedImages = (p.property_images || [])
          .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
          .map((img: any) => img.url);
        
        return {
          id: p.id,
          title: p.title,
          price: p.price,
          type: p.type as 'sale' | 'rent',
          propertyType: p.property_type as 'house' | 'apartment' | 'land' | 'commercial',
          address: p.address,
          city: p.city,
          country: p.country,
          bedrooms: p.bedrooms || 0,
          bathrooms: p.bathrooms || 0,
          area: p.area,
          images: sortedImages.length > 0 ? sortedImages : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'],
          description: p.description || '',
          features: p.features || [],
          lat: p.lat,
          lng: p.lng,
          createdAt: p.created_at,
          userId: p.user_id,
        };
      });
      
      setProperties(transformedProperties);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setPropertiesLoading(false);
    }
  };

  const getCountryName = (code: string | null) => {
    if (!code) return null;
    return africanCountries.find(c => c.code === code)?.name || code;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric'
    });
  };

  const handleContactUser = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    // Navigate to messages with this user
    navigate('/messages', { state: { recipientId: userId } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="bg-card border-b border-border p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="w-24 h-24 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background pb-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Profil introuvable</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Retour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="flex items-center gap-4 p-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display font-semibold text-lg">Profil</h1>
        </div>
      </div>

      {/* Profile Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4"
      >
        <div className="glass-card p-6">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative">
              <img
                src={profile.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop'}
                alt={profile.full_name || 'Utilisateur'}
                className="w-24 h-24 rounded-full object-cover border-4 border-background shadow-lg"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop';
                }}
              />
              {profile.email_verified && (
                <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
                  <BadgeCheck className="w-5 h-5 text-primary-foreground" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-xl">
                  {profile.full_name || 'Utilisateur'}
                </h2>
                {profile.email_verified && (
                  <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                    <BadgeCheck className="w-3 h-3" />
                    Vérifié
                  </span>
                )}
              </div>

              <div className="mt-2 space-y-1">
                {profile.country && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {getCountryName(profile.country)}
                  </p>
                )}
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Membre depuis {formatDate(profile.created_at)}
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  {properties.length} annonce{properties.length > 1 ? 's' : ''} active{properties.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
            <div className="text-center">
              <p className="font-display font-bold text-2xl text-primary">{properties.length}</p>
              <p className="text-xs text-muted-foreground">Annonces</p>
            </div>
            <div className="text-center">
              <p className="font-display font-bold text-2xl text-primary">-</p>
              <p className="text-xs text-muted-foreground">Avis</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Star className="w-5 h-5 text-primary fill-primary" />
                <span className="font-display font-bold text-2xl">-</span>
              </div>
              <p className="text-xs text-muted-foreground">Note</p>
            </div>
          </div>

          {/* Contact Button */}
          {user?.id !== userId && (
            <Button 
              onClick={handleContactUser}
              className="w-full mt-6 gradient-primary"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Contacter
            </Button>
          )}
        </div>
      </motion.div>

      {/* User's Properties */}
      <div className="px-4 mt-2">
        <h3 className="font-display font-semibold text-lg mb-4">
          Annonces de {profile.full_name?.split(' ')[0] || 'cet utilisateur'}
        </h3>

        {propertiesLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : properties.length > 0 ? (
          <div className="space-y-4">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
              />
            ))}
          </div>
        ) : (
          <div className="glass-card p-8 text-center">
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Aucune annonce pour le moment</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProfilePage;
