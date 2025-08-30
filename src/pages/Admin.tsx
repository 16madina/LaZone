import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  Users,
  Building2,
  Crown,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/utils/currency';

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

interface Profile {
  id: string;
  user_id: string;
  user_type: string;
  first_name?: string;
  last_name?: string;
  agency_name?: string;
  country?: string;
  city?: string;
  listing_count?: number;
}

interface Listing {
  id: string;
  title: string;
  price: number;
  currency: string;
  city: string;
  status: string;
  created_at: string;
  user_id: string;
}

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: adminRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (!adminRole) {
        toast({
          title: 'Accès refusé',
          description: 'Vous n\'avez pas les permissions pour accéder à cette page.',
          variant: 'destructive',
        });
        navigate('/profile');
        return;
      }

      setIsAdmin(true);
      await Promise.all([
        fetchUserRoles(),
        fetchProfiles(),
        fetchListings()
      ]);
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserRoles(data || []);
    } catch (error) {
      console.error('Error fetching user roles:', error);
    }
  };

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du panneau admin...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/profile')}
            aria-label="Retour"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-600" />
            <h1 className="text-xl font-bold">Panneau Admin</h1>
          </div>
          <div className="w-10" />
        </div>
      </div>

      <div className="p-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{profiles.length}</div>
              <p className="text-sm text-muted-foreground">Utilisateurs</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Building2 className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{listings.length}</div>
              <p className="text-sm text-muted-foreground">Annonces</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Crown className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{userRoles.filter(r => r.role === 'admin').length}</div>
              <p className="text-sm text-muted-foreground">Administrateurs</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="listings">Annonces</TabsTrigger>
            <TabsTrigger value="roles">Rôles</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Gestion des utilisateurs
                </CardTitle>
                <CardDescription>
                  Liste de tous les utilisateurs inscrits
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-2 p-4">
                  {profiles.map((profile) => (
                    <div key={profile.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">
                          {profile.user_type === 'agence' 
                            ? profile.agency_name 
                            : `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Utilisateur'
                          }
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {profile.city && profile.country 
                            ? `${profile.city}, ${profile.country}`
                            : 'Localisation non spécifiée'
                          }
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={profile.user_type === 'agence' ? 'default' : 'secondary'}>
                          {profile.user_type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {profile.listing_count || 0} annonces
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="listings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Gestion des annonces
                </CardTitle>
                <CardDescription>
                  Dernières annonces publiées
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-2 p-4">
                  {listings.map((listing) => (
                    <div key={listing.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{listing.title}</div>
                        <div className="text-sm text-muted-foreground">{listing.city}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="font-medium">{formatPrice(listing.price, listing.currency)}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(listing.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge variant={listing.status === 'active' ? 'default' : 'secondary'}>
                          {listing.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Gestion des rôles
                </CardTitle>
                <CardDescription>
                  Utilisateurs avec des rôles spéciaux
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-2 p-4">
                  {userRoles.map((userRole) => {
                    const profile = profiles.find(p => p.user_id === userRole.user_id);
                    return (
                      <div key={userRole.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">
                            {profile?.user_type === 'agence' 
                              ? profile.agency_name 
                              : `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Utilisateur'
                            }
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Depuis le {new Date(userRole.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge variant={userRole.role === 'admin' ? 'destructive' : 'default'}>
                          {userRole.role === 'admin' && <Crown className="w-3 h-3 mr-1" />}
                          {userRole.role}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;