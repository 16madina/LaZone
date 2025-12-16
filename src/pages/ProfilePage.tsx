import { useState, useEffect } from 'react';
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
  User
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type TabType = 'profil' | 'annonces' | 'rdv' | 'favoris' | 'parametres';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { favorites } = useAppStore();
  const { user, profile, signOut, loading, isEmailVerified, resendVerificationEmail } = useAuth();
  const [sendingEmail, setSendingEmail] = useState(false);
  const [propertiesCount, setPropertiesCount] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>('profil');

  useEffect(() => {
    if (user) {
      fetchPropertiesCount();
    }
  }, [user]);

  const fetchPropertiesCount = async () => {
    if (!user) return;
    const { count } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    setPropertiesCount(count || 0);
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
        <div className="px-4 -mt-16 pb-24">
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
    <div className="min-h-screen bg-muted/30 pb-24">
      {/* Orange Gradient Header */}
      <div className="h-32 bg-gradient-to-r from-primary via-primary to-primary/80" />

      {/* Profile Card */}
      <div className="px-4 -mt-16">
        <div className="bg-card rounded-2xl shadow-lg overflow-hidden">
          {/* Main Content */}
          <div className="p-5">
            <div className="flex gap-4">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-xl overflow-hidden border-4 border-card shadow-md">
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
                </div>
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
                  {/* Logout Button */}
                  <button
                    onClick={handleSignOut}
                    className="flex-shrink-0 px-3 py-1.5 text-primary border border-primary rounded-lg text-sm font-medium flex items-center gap-1.5 hover:bg-primary/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                  </button>
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
          <div className="grid grid-cols-4 border-t border-border">
            <button 
              onClick={() => navigate('/my-listings')}
              className="p-4 text-center border-r border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-center gap-1 text-foreground font-bold text-lg">
                <Home className="w-4 h-4 text-muted-foreground" />
                <span>{propertiesCount}</span>
              </div>
              <p className="text-xs text-muted-foreground">Annonces</p>
            </button>
            <div className="p-4 text-center border-r border-border">
              <div className="flex items-center justify-center gap-1 text-foreground font-bold text-lg">
                <Heart className="w-4 h-4 text-muted-foreground" />
                <span>{favorites.length}</span>
              </div>
              <p className="text-xs text-muted-foreground">Favoris</p>
            </div>
            <div className="p-4 text-center border-r border-border bg-green-50 dark:bg-green-900/20">
              <div className="flex items-center justify-center gap-1 text-foreground font-bold text-lg">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>0</span>
              </div>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
            <div className="p-4 text-center">
              <div className="flex items-center justify-center gap-1 text-foreground font-bold text-lg">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <span>0</span>
              </div>
              <p className="text-xs text-muted-foreground">Vues</p>
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
              <div className="text-center py-8">
                <User className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-semibold mb-1">Mon Profil</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Gérez vos informations personnelles
                </p>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
                  Modifier le profil
                </button>
              </div>
            )}

            {activeTab === 'annonces' && (
              <div className="text-center py-8">
                <Home className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-semibold mb-1">Mes Annonces</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {propertiesCount} annonce{propertiesCount > 1 ? 's' : ''} publiée{propertiesCount > 1 ? 's' : ''}
                </p>
                <button 
                  onClick={() => navigate('/my-listings')}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
                >
                  Voir mes annonces
                </button>
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
              <div className="text-center py-8">
                <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-semibold mb-1">Mes Favoris</h3>
                <p className="text-sm text-muted-foreground">
                  {favorites.length} bien{favorites.length > 1 ? 's' : ''} sauvegardé{favorites.length > 1 ? 's' : ''}
                </p>
              </div>
            )}

            {activeTab === 'parametres' && (
              <div className="text-center py-8">
                <Settings className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-semibold mb-1">Paramètres</h3>
                <p className="text-sm text-muted-foreground">
                  Notifications, confidentialité, sécurité
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
