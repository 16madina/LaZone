import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  Mail,
  Phone,
  MapPin,
  Calendar,
  Home,
  Heart,
  Users,
  Eye,
  Loader2,
  LogIn,
  CalendarDays,
  RefreshCw,
  Settings,
  User,
  Camera,
  Plus,
  Bell,
  Shield,
  Moon,
  Globe,
  HelpCircle,
  FileText,
  Trash2,
  ChevronRight,
  Bed,
  Bath,
  Maximize,
  EyeOff,
  Lock,
  Fingerprint,
  EyeIcon,
  UserX,
  CreditCard,
  Award,
  Database,
  RotateCcw,
  Coins,
  Share2,
  Star,
  MessageCircle,
  AlertTriangle,
  ShieldCheck,
  Baby,
  Edit,
  Crown
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useAdmin } from '@/hooks/useAdmin';
import { useNotifications } from '@/hooks/useNotifications';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Switch } from '@/components/ui/switch';

type TabType = 'profil' | 'annonces' | 'rdv' | 'favoris' | 'parametres';

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

// Admin Button Component
const AdminButton = () => {
  const navigate = useNavigate();
  const { isAdmin, isModerator, loading } = useAdmin();

  if (loading || (!isAdmin && !isModerator)) {
    return null;
  }

  return (
    <button
      onClick={() => navigate('/admin')}
      className="flex-shrink-0 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-sm font-medium flex items-center gap-1.5 hover:opacity-90 transition-opacity"
    >
      <Crown className="w-4 h-4" />
      Admin
    </button>
  );
};

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_id: string;
  reviewer: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const { favorites, toggleFavorite, loading: loadingFavoritesHook } = useFavorites();
  const { user, profile, signOut, loading, isEmailVerified, resendVerificationEmail, refreshVerificationStatus } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount: notificationCount } = useNotifications();
  const [sendingEmail, setSendingEmail] = useState(false);
  const [propertiesCount, setPropertiesCount] = useState(0);
  const [properties, setProperties] = useState<Property[]>([]);
  const [favoriteProperties, setFavoriteProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('profil');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Settings states
  const [notifications, setNotifications] = useState(true);
  
  // Reviews and follows states
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchPropertiesCount();
      fetchReviews();
      fetchFollowCounts();
    }
  }, [user]);

  useEffect(() => {
    if (user && activeTab === 'annonces') {
      fetchProperties();
    }
  }, [user, activeTab]);

  useEffect(() => {
    if (activeTab === 'favoris') {
      fetchFavoriteProperties();
    }
  }, [activeTab, favorites]);

  const fetchPropertiesCount = async () => {
    if (!user) return;
    const { count } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    setPropertiesCount(count || 0);
  };

  const fetchProperties = async () => {
    if (!user) return;
    setLoadingProperties(true);
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
    } finally {
      setLoadingProperties(false);
    }
  };

  const fetchFavoriteProperties = async () => {
    if (favorites.length === 0) {
      setFavoriteProperties([]);
      return;
    }
    
    setLoadingFavorites(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images (url, is_primary)
        `)
        .in('id', favorites)
        .eq('is_active', true);

      if (error) throw error;
      setFavoriteProperties(data || []);
    } catch (error) {
      console.error('Error fetching favorite properties:', error);
    } finally {
      setLoadingFavorites(false);
    }
  };

  const fetchReviews = async () => {
    if (!user) return;
    setReviewsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_reviews')
        .select('id, rating, comment, created_at, reviewer_id')
        .eq('reviewed_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch reviewer profiles
      const reviewerIds = [...new Set((data || []).map(r => r.reviewer_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', reviewerIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      const reviewsWithProfiles: Review[] = (data || []).map(r => ({
        ...r,
        reviewer: profileMap.get(r.reviewer_id) || null
      }));

      setReviews(reviewsWithProfiles);

      if (reviewsWithProfiles.length > 0) {
        const avg = reviewsWithProfiles.reduce((sum, r) => sum + r.rating, 0) / reviewsWithProfiles.length;
        setAverageRating(Math.round(avg * 10) / 10);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchFollowCounts = async () => {
    if (!user) return;
    try {
      // Fetch followers count
      const { count: followers } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', user.id);

      // Fetch following count
      const { count: following } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', user.id);

      setFollowersCount(followers || 0);
      setFollowingCount(following || 0);
    } catch (error) {
      console.error('Error fetching follow counts:', error);
    }
  };

  const handleRemoveFavorite = async (propertyId: string) => {
    await toggleFavorite(propertyId);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      await refreshVerificationStatus();

      toast({
        title: 'Photo mise à jour',
        description: 'Votre photo de profil a été modifiée avec succès.',
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la photo.',
        variant: 'destructive',
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleResendVerification = async () => {
    setSendingEmail(true);
    const result = await resendVerificationEmail();
    setSendingEmail(false);
    
    if (result.success) {
      toast({
        title: 'Email envoyé',
        description: 'Un nouveau lien de vérification vous a été envoyé.',
      });
    } else {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer l\'email. Veuillez réessayer.',
        variant: 'destructive',
      });
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
      });
    } catch (error) {
      console.error('Error toggling property status:', error);
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
      setPropertiesCount(prev => prev - 1);

      toast({
        title: 'Annonce supprimée',
      });
    } catch (error) {
      console.error('Error deleting property:', error);
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

  const memberSince = user?.created_at 
    ? format(new Date(user.created_at), "MMMM yyyy", { locale: fr })
    : 'décembre 2025';

  const tabs = [
    { id: 'profil' as TabType, label: 'Profil', icon: User },
    { id: 'annonces' as TabType, label: 'Annonces', icon: Home },
    { id: 'rdv' as TabType, label: 'Mes RDV', icon: CalendarDays },
    { id: 'favoris' as TabType, label: 'Favoris', icon: Heart },
    { id: 'parametres' as TabType, label: 'Paramètres', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Guest view
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/20 to-background">
        <div className="h-32 bg-gradient-to-r from-primary to-primary/80" />
        <div className="px-4 -mt-16 pb-32">
          <div className="bg-card rounded-2xl shadow-lg p-6 text-center">
            <div className="w-24 h-24 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
              <span className="text-4xl">👤</span>
            </div>
            <h2 className="text-xl font-bold mb-2">Invité</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Connectez-vous pour accéder à toutes les fonctionnalités
            </p>
            <button
              onClick={() => navigate('/auth')}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Se connecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-32">
      {/* Hidden file input for avatar upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
        className="hidden"
      />

      {/* Orange Gradient Header */}
      <div className="h-32 bg-gradient-to-r from-primary via-primary to-primary/80" />

      {/* Profile Card */}
      <div className="px-4 -mt-16">
        <div className="bg-card rounded-2xl shadow-lg overflow-hidden">
          {/* Main Content */}
          <div className="p-5">
            <div className="flex gap-4">
              {/* Avatar with upload button */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={handleAvatarClick}
                  disabled={uploadingAvatar}
                  className="relative w-24 h-24 rounded-xl overflow-hidden border-4 border-card shadow-md group"
                >
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-3xl">👤</span>
                    </div>
                  )}
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {uploadingAvatar ? (
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    ) : (
                      <Camera className="w-6 h-6 text-white" />
                    )}
                  </div>
                </button>
                {/* Verification Badge */}
                <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                  isEmailVerified 
                    ? 'bg-green-500 text-white' 
                    : 'bg-primary text-primary-foreground'
                }`}>
                  {isEmailVerified ? 'Vérifié' : 'Non vérifié'}
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h1 className="text-lg font-bold text-foreground truncate">
                    {user.user_metadata?.full_name || 'Utilisateur'}
                  </h1>
                  <div className="flex items-center gap-2">
                    {/* Notifications Button */}
                    <button
                      onClick={() => navigate('/notifications')}
                      className="relative flex-shrink-0 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                      <Bell className="w-5 h-5" />
                      {notificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                          {notificationCount > 9 ? '9+' : notificationCount}
                        </span>
                      )}
                    </button>
                    {/* Admin Button */}
                    <AdminButton />
                    {/* Logout Button */}
                    <button
                      onClick={handleSignOut}
                      className="flex-shrink-0 px-3 py-1.5 text-primary border border-primary rounded-lg text-sm font-medium flex items-center gap-1.5 hover:bg-primary/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Déconnexion
                    </button>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Particulier
                  </span>
                  {!isEmailVerified && (
                    <>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                        ⚠ Email non vérifié
                      </span>
                      <button 
                        onClick={handleResendVerification}
                        disabled={sendingEmail}
                        className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1 hover:bg-green-200 transition-colors disabled:opacity-50"
                      >
                        {sendingEmail ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3 h-3" />
                        )}
                        Renvoyer le lien
                      </button>
                    </>
                  )}
                </div>

                {/* Contact Info */}
                <div className="mt-3 space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  {user.user_metadata?.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{user.user_metadata.phone}</span>
                    </div>
                  )}
                  {user.user_metadata?.city && user.user_metadata?.country && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{user.user_metadata.city}, {user.user_metadata.country}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Membre depuis {memberSince}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-5 border-t border-border">
            <button 
              onClick={() => setActiveTab('annonces')}
              className="p-3 text-center border-r border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-center gap-1 text-foreground font-bold text-lg">
                <Home className="w-4 h-4 text-muted-foreground" />
                <span>{propertiesCount}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">Annonces</p>
            </button>
            <button 
              onClick={() => setActiveTab('favoris')}
              className="p-3 text-center border-r border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-center gap-1 text-foreground font-bold text-lg">
                <Heart className="w-4 h-4 text-muted-foreground" />
                <span>{favorites.length}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">Favoris</p>
            </button>
            <button 
              onClick={() => navigate('/followers?tab=followers')}
              className="p-3 text-center border-r border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-center gap-1 text-foreground font-bold text-lg">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>{followersCount}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">Followers</p>
            </button>
            <button 
              onClick={() => navigate('/followers?tab=following')}
              className="p-3 text-center border-r border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-center gap-1 text-foreground font-bold text-lg">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>{followingCount}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">Suivis</p>
            </button>
            <div className="p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-foreground font-bold text-lg">
                <Star className="w-4 h-4 text-primary fill-primary" />
                <span>{averageRating || '-'}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">Note</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 bg-card rounded-2xl shadow-sm overflow-hidden">
          <div className="flex overflow-x-auto scrollbar-hide border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-max px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary bg-primary/5'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {activeTab === 'profil' && (
              <div className="space-y-6">
                {/* Profile Info Cards */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                    <Mail className="w-5 h-5 text-primary" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium">{user.email}</p>
                    </div>
                  </div>
                  
                  {user.user_metadata?.phone && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                      <Phone className="w-5 h-5 text-primary" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Téléphone</p>
                        <p className="text-sm font-medium">{user.user_metadata.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {user.user_metadata?.city && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                      <MapPin className="w-5 h-5 text-primary" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Localisation</p>
                        <p className="text-sm font-medium">{user.user_metadata.city}, {user.user_metadata.country}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Reviews Section */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary" />
                    Avis reçus ({reviews.length})
                  </h3>
                  
                  {reviewsLoading ? (
                    <div className="text-center py-4">
                      <Loader2 className="w-6 h-6 mx-auto animate-spin text-primary" />
                    </div>
                  ) : reviews.length > 0 ? (
                    <div className="space-y-3">
                      {reviews.map((review) => (
                        <div key={review.id} className="p-3 bg-muted/50 rounded-xl">
                          <div className="flex items-start gap-3">
                            <img
                              src={review.reviewer?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop'}
                              alt={review.reviewer?.full_name || 'Utilisateur'}
                              className="w-10 h-10 rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop';
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-sm">{review.reviewer?.full_name || 'Utilisateur'}</p>
                                <div className="flex items-center gap-0.5">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-3 h-3 ${
                                        star <= review.rating 
                                          ? 'text-primary fill-primary' 
                                          : 'text-muted-foreground'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              {review.comment && (
                                <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-muted/30 rounded-xl">
                      <Star className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Aucun avis pour le moment</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'annonces' && (
              <div>
                {/* Add new listing button */}
                <button
                  onClick={() => navigate('/publish')}
                  className="w-full mb-4 py-3 border-2 border-dashed border-primary/50 rounded-xl text-primary font-medium flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Ajouter une annonce
                </button>

                {loadingProperties ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
                  </div>
                ) : properties.length === 0 ? (
                  <div className="text-center py-8">
                    <Home className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <h3 className="font-semibold mb-1">Aucune annonce</h3>
                    <p className="text-sm text-muted-foreground">
                      Vous n'avez pas encore publié d'annonce.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {properties.map((property) => (
                      <div
                        key={property.id}
                        className="bg-muted/30 rounded-xl overflow-hidden"
                      >
                        <div className="flex">
                          <div className="w-24 h-24 flex-shrink-0">
                            <img
                              src={getPrimaryImage(property.property_images)}
                              alt={property.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 p-2">
                            <div className="flex items-start justify-between gap-1">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-sm truncate">{property.title}</h3>
                                <p className="text-primary font-bold text-sm">{formatPrice(property.price)}</p>
                              </div>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                property.is_active 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {property.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-0.5">
                                <Bed className="w-3 h-3" />
                                {property.bedrooms || 0}
                              </span>
                              <span className="flex items-center gap-0.5">
                                <Bath className="w-3 h-3" />
                                {property.bathrooms || 0}
                              </span>
                              <span className="flex items-center gap-0.5">
                                <Maximize className="w-3 h-3" />
                                {property.area}m²
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <button
                                onClick={() => navigate(`/property/${property.id}`)}
                                className="p-1 rounded bg-muted"
                              >
                                <Eye className="w-3 h-3 text-muted-foreground" />
                              </button>
                              <button
                                onClick={() => togglePropertyStatus(property.id, property.is_active)}
                                className="p-1 rounded bg-muted"
                              >
                                {property.is_active ? (
                                  <EyeOff className="w-3 h-3 text-muted-foreground" />
                                ) : (
                                  <Eye className="w-3 h-3 text-green-600" />
                                )}
                              </button>
                              <button
                                onClick={() => deleteProperty(property.id)}
                                className="p-1 rounded bg-red-50"
                              >
                                <Trash2 className="w-3 h-3 text-red-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'rdv' && (
              <div className="text-center py-8">
                <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-semibold mb-1">Mes Rendez-vous</h3>
                <p className="text-sm text-muted-foreground">
                  Aucun rendez-vous prévu
                </p>
              </div>
            )}

            {activeTab === 'favoris' && (
              <div>
                {loadingFavorites ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
                  </div>
                ) : favoriteProperties.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <h3 className="font-semibold mb-1">Aucun favori</h3>
                    <p className="text-sm text-muted-foreground">
                      Vous n'avez pas encore de propriétés favorites.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {favoriteProperties.map((property) => (
                      <div
                        key={property.id}
                        className="bg-muted/30 rounded-xl overflow-hidden"
                      >
                        <div className="flex">
                          <div className="w-24 h-24 flex-shrink-0">
                            <img
                              src={getPrimaryImage(property.property_images)}
                              alt={property.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 p-2">
                            <div className="flex items-start justify-between gap-1">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-sm truncate">{property.title}</h3>
                                <p className="text-primary font-bold text-sm">{formatPrice(property.price)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{property.city}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-0.5">
                                <Bed className="w-3 h-3" />
                                {property.bedrooms || 0}
                              </span>
                              <span className="flex items-center gap-0.5">
                                <Bath className="w-3 h-3" />
                                {property.bathrooms || 0}
                              </span>
                              <span className="flex items-center gap-0.5">
                                <Maximize className="w-3 h-3" />
                                {property.area}m²
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <button
                                onClick={() => navigate(`/property/${property.id}`)}
                                className="p-1 rounded bg-muted"
                              >
                                <Eye className="w-3 h-3 text-muted-foreground" />
                              </button>
                              <button
                                onClick={() => handleRemoveFavorite(property.id)}
                                className="p-1 rounded bg-red-50"
                                title="Retirer des favoris"
                              >
                                <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'parametres' && (
              <div className="space-y-6">
                {/* Compte */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Compte</h3>
                  <div className="space-y-2">
                    <button onClick={() => navigate('/settings/edit-profile')} className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <Edit className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Modifier le profil</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <button onClick={() => navigate('/settings/account')} className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <Trash2 className="w-5 h-5 text-destructive" />
                        <span className="text-sm font-medium">Gestion du compte</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {/* Sécurité & Confidentialité */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Sécurité & Confidentialité</h3>
                  <div className="space-y-2">
                    <button onClick={() => navigate('/settings/change-password')} className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <Lock className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Changer le mot de passe</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <button onClick={() => navigate('/settings/security')} className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Authentification 2FA</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <button onClick={() => navigate('/settings/security')} className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <Fingerprint className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Biométrie (Face ID/Touch ID)</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <button onClick={() => navigate('/settings/security')} className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <EyeIcon className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Visibilité du profil</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <button onClick={() => navigate('/settings/security')} className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <UserX className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Utilisateurs bloqués</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {/* Notifications */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Notifications</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Notifications push</span>
                      </div>
                      <Switch checked={notifications} onCheckedChange={setNotifications} />
                    </div>
                    <button onClick={() => navigate('/settings/notifications')} className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <MessageCircle className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Préférences de notifications</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {/* Paiements */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Paiements</h3>
                  <div className="space-y-2">
                    <button onClick={() => toast({ title: 'Bientôt disponible', description: 'L\'historique des ventes sera disponible prochainement.' })} className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Historique des ventes</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {/* Apparence */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Apparence</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Moon className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Mode sombre</span>
                      </div>
                      <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
                    </div>
                    <button onClick={() => toast({ title: 'Bientôt disponible', description: 'Les badges vendeur seront disponibles prochainement.' })} className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <Award className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Badges vendeur</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {/* Stockage & Données */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Stockage & Données</h3>
                  <div className="space-y-2">
                    <button onClick={() => { localStorage.clear(); toast({ title: 'Cache vidé', description: 'Le cache de l\'application a été vidé.' }); }} className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <Database className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Vider le cache</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <button onClick={() => toast({ title: 'Tutoriel réinitialisé', description: 'Le tutoriel sera affiché à nouveau.' })} className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <RotateCcw className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Réinitialiser le tutoriel</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {/* Paramètres régionaux */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Paramètres régionaux</h3>
                  <div className="space-y-2">
                    <button onClick={() => navigate('/settings/regional')} className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-primary" />
                        <div className="text-left">
                          <span className="text-sm font-medium">Langue</span>
                          <p className="text-xs text-muted-foreground">Français</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <button onClick={() => navigate('/settings/regional')} className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <Coins className="w-5 h-5 text-primary" />
                        <div className="text-left">
                          <span className="text-sm font-medium">Devise</span>
                          <p className="text-xs text-muted-foreground">FCFA</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {/* Partager */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Application</h3>
                  <div className="space-y-2">
                    <button onClick={() => navigator.share?.({ title: 'LaZone', text: 'Découvrez LaZone - Immobilier en Afrique', url: window.location.origin }) || toast({ title: 'Partage non disponible' })} className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <Share2 className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Partager l'application</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <button onClick={() => toast({ title: 'Merci !', description: 'La notation sera disponible sur les stores mobiles.' })} className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <Star className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Noter l'application</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {/* Centre d'aide */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Centre d'aide</h3>
                  <div className="space-y-2">
                    <button onClick={() => navigate('/settings/help')} className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <HelpCircle className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">FAQ</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <button onClick={() => navigate('/settings/support')} className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <MessageCircle className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Support</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <button onClick={() => navigate('/settings/support')} className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Signaler un problème</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {/* Légal */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Légal</h3>
                  <div className="space-y-2">
                    <button onClick={() => navigate('/settings/legal/terms')} className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Conditions d'utilisation</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <button onClick={() => navigate('/settings/legal/privacy')} className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Politique de confidentialité</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <button onClick={() => navigate('/settings/legal/community')} className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Règles de la communauté</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <button onClick={() => navigate('/settings/legal/child-safety')} className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <Baby className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Sécurité et protection (enfants)</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {/* Déconnexion */}
                <div className="pt-2">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 p-4 bg-destructive/10 text-destructive rounded-xl font-medium hover:bg-destructive/20 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Déconnexion
                  </button>
                </div>

                {/* Version */}
                <p className="text-center text-xs text-muted-foreground pt-4">
                  Version 1.0.0 • LaZone © 2025
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
