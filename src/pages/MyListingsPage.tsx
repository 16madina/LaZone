import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Home, 
  MapPin, 
  Bed, 
  Bath, 
  Maximize,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Property {
  id: string;
  title: string;
  price: number;
  address: string;
  city: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number;
  property_type: string;
  type: string;
  is_active: boolean;
  created_at: string;
  property_images: { url: string; is_primary: boolean }[];
}

const MyListingsPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    
    if (user) {
      fetchProperties();
    }
  }, [user, authLoading]);

  const fetchProperties = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images (url, is_primary)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger vos annonces.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePropertyStatus = async (propertyId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ is_active: !currentStatus })
        .eq('id', propertyId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setProperties(prev => 
        prev.map(p => 
          p.id === propertyId ? { ...p, is_active: !currentStatus } : p
        )
      );

      toast({
        title: currentStatus ? 'Annonce désactivée' : 'Annonce activée',
        description: currentStatus 
          ? 'Votre annonce n\'est plus visible.' 
          : 'Votre annonce est maintenant visible.',
      });
    } catch (error) {
      console.error('Error toggling property status:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le statut.',
        variant: 'destructive',
      });
    }
  };

  const deleteProperty = async (propertyId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) return;

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setProperties(prev => prev.filter(p => p.id !== propertyId));

      toast({
        title: 'Annonce supprimée',
        description: 'Votre annonce a été supprimée avec succès.',
      });
    } catch (error) {
      console.error('Error deleting property:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'annonce.',
        variant: 'destructive',
      });
    }
  };

  const getPrimaryImage = (images: { url: string; is_primary: boolean }[]) => {
    const primary = images?.find(img => img.is_primary);
    return primary?.url || images?.[0]?.url || '/placeholder.svg';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-32">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-primary to-primary/80 text-primary-foreground">
        <div className="flex items-center gap-4 px-4 py-4">
          <button 
            onClick={() => navigate('/profile')}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Mes Annonces</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {properties.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Home className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Aucune annonce</h2>
            <p className="text-muted-foreground mb-6">
              Vous n'avez pas encore publié d'annonce.
            </p>
            <button
              onClick={() => navigate('/publish')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium"
            >
              <Plus className="w-5 h-5" />
              Publier une annonce
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {properties.length} annonce{properties.length > 1 ? 's' : ''}
              </p>
              <button
                onClick={() => navigate('/publish')}
                className="inline-flex items-center gap-1 text-sm text-primary font-medium"
              >
                <Plus className="w-4 h-4" />
                Nouvelle annonce
              </button>
            </div>

            {/* Property List */}
            {properties.map((property) => (
              <div
                key={property.id}
                className="bg-card rounded-xl shadow-sm overflow-hidden"
              >
                <div className="flex">
                  {/* Image */}
                  <div className="w-32 h-32 flex-shrink-0">
                    <img
                      src={getPrimaryImage(property.property_images)}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">
                          {property.title}
                        </h3>
                        <p className="text-primary font-bold text-sm mt-0.5">
                          {formatPrice(property.price)}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        property.is_active 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {property.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{property.city}</span>
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      {property.bedrooms !== null && (
                        <span className="flex items-center gap-1">
                          <Bed className="w-3 h-3" />
                          {property.bedrooms}
                        </span>
                      )}
                      {property.bathrooms !== null && (
                        <span className="flex items-center gap-1">
                          <Bath className="w-3 h-3" />
                          {property.bathrooms}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Maximize className="w-3 h-3" />
                        {property.area}m²
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => navigate(`/property/${property.id}`)}
                        className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                        title="Voir"
                      >
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => togglePropertyStatus(property.id, property.is_active)}
                        className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                        title={property.is_active ? 'Désactiver' : 'Activer'}
                      >
                        {property.is_active ? (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Eye className="w-4 h-4 text-green-600" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteProperty(property.id)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListingsPage;
