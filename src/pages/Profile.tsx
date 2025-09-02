import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Trash2,
  Upload,
  CheckCircle,
  MessageCircle,
  Crown
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/utils/currency';
import { useFavoritesContext } from '@/contexts/FavoritesContext';

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
  is_canvasser?: boolean;
  avatar_url?: string;
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
  const { favorites } = useFavoritesContext();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('annonces');
  const [isAdmin, setIsAdmin] = useState(false);

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
          fetchListings(user.id),
          checkAdminRole(user.id)
        ]);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      console.log('Admin role check:', { userId, data, error, isAdmin: !!data });
      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error checking admin role:', error);
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

      console.log('Profil récupéré:', data);
      console.log('Avatar URL dans le profil:', data?.avatar_url);
      
      setProfile(data as Profile);
      // Set avatar preview from existing avatar_url
      if (data?.avatar_url) {
        console.log('Définition de l\'avatar preview:', data.avatar_url);
        setAvatarPreview(data.avatar_url);
      } else {
        console.log('Aucun avatar_url trouvé dans le profil');
        setAvatarPreview(null);
      }
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

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) return;
    
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId)
        .eq('user_id', user.id);

      if (error) throw error;

      setListings(listings.filter(l => l.id !== listingId));
      toast({
        title: 'Succès',
        description: 'Annonce supprimée avec succès',
      });
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la suppression',
        variant: 'destructive',
      });
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

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile || !user) return;
    
    try {
      // Create avatar bucket if it doesn't exist
      const bucketName = 'avatars';
      const fileName = `${user.id}/avatar.${avatarFile.name.split('.').pop()}`;
      
      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, avatarFile, {
          upsert: true,
          contentType: avatarFile.type
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      console.log('URL publique générée:', publicUrl);
      
      // Update profile with avatar URL
      const { error: updateError, data: updateData } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl } as any)
        .eq('user_id', user.id)
        .select();

      console.log('Résultat de la mise à jour:', { updateError, updateData });

      if (updateError) throw updateError;

      // Update local state
      if (profile) {
        setProfile({ ...profile, avatar_url: publicUrl });
      }
      setAvatarFile(null);
      
      toast({
        title: 'Succès',
        description: 'Photo de profil mise à jour',
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la mise à jour',
        variant: 'destructive',
      });
    }
  };

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
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/admin')}
                title="Admin Panel"
              >
                <Crown className="w-5 h-5 text-yellow-600" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/settings')}
              title="Paramètres"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* User Info Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="relative">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={avatarPreview || profile?.avatar_url || undefined} />
                  <AvatarFallback>
                    <User className="w-8 h-8" />
                  </AvatarFallback>
                </Avatar>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  id="avatar-upload-main"
                />
                <Button 
                  size="icon" 
                  variant="secondary"
                  className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full"
                  onClick={() => document.getElementById('avatar-upload-main')?.click()}
                >
                  <Camera className="w-3 h-3" />
                </Button>
                {avatarFile && (
                  <Button 
                    size="sm" 
                    className="absolute -top-2 -right-2 h-6 px-2 text-xs"
                    onClick={handleAvatarUpload}
                  >
                    Sauvegarder
                  </Button>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-semibold">{getDisplayName()}</h2>
                  {profile?.is_canvasser && profile.user_type === 'particulier' && (
                    <Badge variant="secondary" className="text-blue-600 border-blue-200 bg-blue-50">
                      Démarcheur
                    </Badge>
                  )}
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
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => navigate('/favorites')}
          >
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="w-4 h-4 text-primary" />
                <span className="text-2xl font-bold">{favorites.length}</span>
              </div>
              <p className="text-sm text-muted-foreground">Favoris</p>
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => setActiveTab('annonces')}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold mb-1">{listings.length}</div>
              <p className="text-sm text-muted-foreground">Mes annonces</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="annonces">Annonces</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="verification">Vérification</TabsTrigger>
            <TabsTrigger value="aide">Aide</TabsTrigger>
          </TabsList>

          <TabsContent value="annonces" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Mes annonces
                </CardTitle>
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
                              <div className="w-12 h-12 bg-muted rounded-md overflow-hidden flex-shrink-0">
                                {listing.images && listing.images.length > 0 ? (
                                  <img 
                                    src={listing.images[0]} 
                                    alt={listing.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-muted">
                                    <PropertyIcon className="w-6 h-6 text-muted-foreground" />
                                  </div>
                                )}
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
                                  <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => navigate(`/property/${listing.id}`)}>
                                    <Eye className="w-3 h-3 mr-1" />
                                    Voir
                                  </Button>
                                  <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => navigate(`/edit-listing/${listing.id}`)}>
                                    <Edit className="w-3 h-3 mr-1" />
                                    Modifier
                                  </Button>
                                  <Button size="sm" variant="outline" className="h-7 px-2 text-destructive hover:text-destructive" onClick={() => handleDeleteListing(listing.id)}>
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
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Gérez vos préférences de notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Notifications push</p>
                      <p className="text-sm text-muted-foreground">Recevoir des notifications sur votre appareil</p>
                    </div>
                    <Switch checked={notifications} onCheckedChange={setNotifications} />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Notifications par email</p>
                      <p className="text-sm text-muted-foreground">Recevoir des emails pour les mises à jour importantes</p>
                    </div>
                    <Switch />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Messages des acheteurs</p>
                      <p className="text-sm text-muted-foreground">Notifications quand quelqu'un vous contacte</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verification" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Vérification du compte
                </CardTitle>
                <CardDescription>
                  Vérifiez votre identité pour augmenter la confiance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    <div className="flex-1">
                      <p className="font-medium text-orange-800">Compte non vérifié</p>
                      <p className="text-sm text-orange-700">Vérifiez votre identité pour accéder à toutes les fonctionnalités</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Email vérifié</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                      <span>Téléphone non vérifié</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                      <span>Identité non vérifiée</span>
                    </div>
                  </div>
                  
                  <Button className="w-full">
                    Commencer la vérification
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="aide" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  Aide et support
                </CardTitle>
                <CardDescription>
                  Obtenez de l'aide ou contactez notre support
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Centre d'aide
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contacter le support
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Signaler un problème
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Star className="w-4 h-4 mr-2" />
                    Évaluer l'application
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Logout */}
        <Button 
          variant="outline" 
          className="w-full justify-start text-destructive mt-6" 
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