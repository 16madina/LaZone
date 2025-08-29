import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut,
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  Camera,
  Plus,
  Home,
  Building2,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/utils/currency';

interface Profile {
  id: string;
  user_type: 'particulier' | 'agence';
  first_name?: string;
  last_name?: string;
  agency_name?: string;
  responsible_first_name?: string;
  responsible_last_name?: string;
  country?: string;
  city?: string;
  neighborhood?: string;
  phone?: string;
  agency_phone?: string;
  responsible_mobile?: string;
}

interface Listing {
  id: string;
  purpose: 'rent' | 'sale';
  property_type: 'apartment' | 'house' | 'land';
  title: string;
  description?: string;
  price: number;
  currency: string;
  bedrooms?: number;
  bathrooms?: number;
  area: number;
  land_area?: number;
  address: string;
  city: string;
  neighborhood: string;
  country?: string;
  amenities: string[];
  images: string[];
  status: 'active' | 'inactive' | 'sold' | 'rented';
  created_at: string;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUser(user);
        await Promise.all([
          fetchProfile(user.id),
          fetchListings(user.id)
        ]);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw error;
      }

      setProfile(data as Profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchListings = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings((data || []) as Listing[]);
    } catch (error) {
      console.error('Error fetching listings:', error);
    }
  };

  const handleLogin = () => {
    navigate('/auth?next=' + encodeURIComponent('/profile'));
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: 'Déconnexion réussie',
        description: 'À bientôt sur LaZone !',
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la déconnexion',
        variant: 'destructive',
      });
    }
  };

  const getPropertyIcon = (type: string) => {
    switch (type) {
      case 'apartment': return Building2;
      case 'house': return Home;
      case 'land': return MapPin;
      default: return Building2;
    }
  };

  const getDisplayName = () => {
    if (!profile) return user?.email || 'Utilisateur';
    
    if (profile.user_type === 'agence') {
      return profile.agency_name || 'Agence';
    } else {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || user?.email || 'Utilisateur';
    }
  };

  const getContactInfo = () => {
    if (!profile) return { phone: '', location: '' };
    
    const phone = profile.user_type === 'agence' 
      ? profile.responsible_mobile || profile.agency_phone 
      : profile.phone;
    
    const location = [profile.city, profile.country].filter(Boolean).join(', ');
    
    return { phone: phone || '', location };
  };

  const menuItems = [
    {
      icon: Bell,
      label: 'Notifications',
      action: () => {},
      hasSwitch: true,
      switchValue: notifications,
      onSwitchChange: setNotifications
    },
    {
      icon: Settings,
      label: 'Paramètres du compte',
      action: () => navigate('/settings')
    },
    {
      icon: Shield,
      label: 'Vérification du compte',
      action: () => navigate('/verification'),
      badge: 'Action requise',
      badgeVariant: 'destructive' as const
    },
    {
      icon: HelpCircle,
      label: 'Aide et support',
      action: () => navigate('/help')
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // Guest/unauthenticated view
  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="sticky top-0 z-10 bg-background border-b border-border">
          <div className="flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              aria-label="Retour"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">Profil</h1>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center h-96 text-center p-6">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
            <User className="w-10 h-10 text-muted-foreground" />
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Bienvenue sur LaZone</h2>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Connectez-vous pour accéder à vos favoris, gérer vos annonces et profiter de toutes les fonctionnalités.
          </p>
          
          <div className="space-y-3 w-full max-w-sm">
            <Button onClick={handleLogin} className="w-full">
              Se connecter
            </Button>
            <Button variant="outline" onClick={() => navigate('/auth?mode=register')} className="w-full">
              Créer un compte
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { phone, location } = getContactInfo();

  // Authenticated user view
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            aria-label="Retour"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Profil</h1>
          <Button variant="ghost" size="sm">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* User Info Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-muted rounded-full overflow-hidden flex items-center justify-center">
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
                <Button 
                  size="icon" 
                  variant="secondary"
                  className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full"
                >
                  <Camera className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-semibold">{getDisplayName()}</h2>
                  <Badge variant="outline" className="text-orange-600 border-orange-200">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Non vérifié
                  </Badge>
                </div>
                
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    <span>{user.email}</span>
                  </div>
                  {phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      <span>{phone}</span>
                    </div>
                  )}
                  {location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{location}</span>
                    </div>
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground mt-2">
                  Membre depuis {new Date(user.created_at).getFullYear()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="w-4 h-4 text-primary" />
                <span className="text-2xl font-bold">0</span>
              </div>
              <p className="text-sm text-muted-foreground">Favoris</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold mb-1">{listings.length}</div>
              <p className="text-sm text-muted-foreground">Mes annonces</p>
            </CardContent>
          </Card>
        </div>

        {/* Mes Annonces */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">Mes annonces</CardTitle>
            <Button size="sm" onClick={() => navigate('/new')}>
              <Plus className="w-4 h-4 mr-1" />
              Nouvelle
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {listings.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="mb-2">Aucune annonce pour le moment</p>
                <p className="text-sm mb-4">Créez votre première annonce pour commencer à louer ou vendre vos biens.</p>
                <Button onClick={() => navigate('/new')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Créer une annonce
                </Button>
              </div>
            ) : (
              <div className="space-y-0">
                {listings.map((listing, index) => {                  
                  const PropertyIcon = getPropertyIcon(listing.property_type);
                  return (
                    <div key={listing.id}>
                      <div className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                            <PropertyIcon className="w-6 h-6 text-muted-foreground" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-sm truncate">{listing.title}</h3>
                                <p className="text-xs text-muted-foreground truncate">
                                  {listing.neighborhood}, {listing.city}
                                </p>
                                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                  <span>{listing.area} m²</span>
                                  {listing.bedrooms && (
                                    <span>{listing.bedrooms} ch.</span>
                                  )}
                                  <Badge variant={listing.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                                    {listing.status === 'active' ? 'Actif' : 'Inactif'}
                                  </Badge>
                                </div>
                              </div>
                              
                              <div className="text-right flex-shrink-0">
                                <p className="font-semibold text-sm">
                                  {formatPrice(listing.price, listing.currency)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {listing.purpose === 'rent' ? '/mois' : ''}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1 mt-3">
                              <Button size="sm" variant="outline" className="h-7 px-2">
                                <Eye className="w-3 h-3 mr-1" />
                                Voir
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 px-2">
                                <Edit className="w-3 h-3 mr-1" />
                                Modifier
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 px-2 text-destructive hover:text-destructive">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      {index < listings.length - 1 && <Separator />}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Menu */}
        <Card>
          <CardContent className="p-0">
            {menuItems.map((item, index) => (
              <div key={item.label}>
                <button
                  onClick={item.action}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <Badge variant={item.badgeVariant || 'secondary'}>
                        {item.badge}
                      </Badge>
                    )}
                    {item.hasSwitch ? (
                      <Switch 
                        checked={item.switchValue}
                        onCheckedChange={item.onSwitchChange}
                      />
                    ) : (
                      <span className="text-muted-foreground">›</span>
                    )}
                  </div>
                </button>
                {index < menuItems.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Logout */}
        <Button 
          variant="outline" 
          className="w-full justify-start text-destructive" 
          size="lg"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Se déconnecter
        </Button>
      </div>
    </div>
  );
};

export default Profile;