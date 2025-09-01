import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  ArrowLeft,
  Users,
  Building2,
  Crown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Ban,
  Trash2,
  MessageCircle,
  UserCheck,
  Shield,
  History,
  Phone,
  TrendingUp,
  Settings,
  DollarSign
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/utils/currency';
import PropertyStats from '@/components/PropertyStats';

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
  account_status?: string;
  banned_at?: string;
  ban_reason?: string;
  phone?: string;
  agency_phone?: string;
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

interface AdminAction {
  id: string;
  admin_user_id: string;
  target_user_id: string;
  action_type: string;
  reason?: string;
  details?: any;
  created_at: string;
}

interface AppSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  description?: string;
  created_at: string;
  updated_at: string;
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
  const [adminActions, setAdminActions] = useState<AdminAction[]>([]);
  const [appSettings, setAppSettings] = useState<AppSetting[]>([]);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Dialog states
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [smsDialogOpen, setSmsDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  // Settings states
  const [monthlyPrice, setMonthlyPrice] = useState(5000);
  const [perListingPrice, setPerListingPrice] = useState(1000);
  const [freeListingsIndividual, setFreeListingsIndividual] = useState(3);
  const [freeListingsCanvasser, setFreeListingsCanvasser] = useState(3);
  const [freeListingsAgency, setFreeListingsAgency] = useState(0);
  const [settingsLoading, setSettingsLoading] = useState(false);

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
        fetchListings(),
        fetchAdminActions(),
        fetchAppSettings()
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

  const fetchAdminActions = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_actions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setAdminActions(data || []);
    } catch (error) {
      console.error('Error fetching admin actions:', error);
    }
  };

  const fetchAppSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .order('setting_key');

      if (error) throw error;
      setAppSettings(data || []);

      // Load settings into state
      data?.forEach(setting => {
        const value = setting.setting_value as any;
        switch (setting.setting_key) {
          case 'subscription_monthly_price':
            setMonthlyPrice(value?.amount || 5000);
            break;
          case 'subscription_per_listing_price':
            setPerListingPrice(value?.amount || 1000);
            break;
          case 'free_listings_limit_individual':
            setFreeListingsIndividual(value?.limit || 3);
            break;
          case 'free_listings_limit_canvasser':
            setFreeListingsCanvasser(value?.limit || 3);
            break;
          case 'free_listings_limit_agency':
            setFreeListingsAgency(value?.limit || 0);
            break;
        }
      });
    } catch (error) {
      console.error('Error fetching app settings:', error);
    }
  };

  const updateAppSetting = async (settingKey: string, settingValue: any) => {
    try {
      console.log(`🔧 Updating setting: ${settingKey} = ${settingValue}`);
      
      const { error } = await supabase
        .from('app_settings')
        .update({ setting_value: settingValue })
        .eq('setting_key', settingKey);

      if (error) throw error;
      
      console.log(`✅ Setting ${settingKey} updated successfully`);
      
      toast({
        title: 'Paramètre mis à jour',
        description: 'Le paramètre a été modifié avec succès.',
      });

      fetchAppSettings();
    } catch (error: any) {
      console.error(`❌ Error updating ${settingKey}:`, error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le paramètre.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdatePricing = async () => {
    setSettingsLoading(true);
    try {
      await Promise.all([
        updateAppSetting('monthly_price', monthlyPrice),
        updateAppSetting('per_listing_price', perListingPrice),
        updateAppSetting('free_listings_individual', freeListingsIndividual),
        updateAppSetting('free_listings_canvasser', freeListingsCanvasser),
        updateAppSetting('free_listings_agency', freeListingsAgency)
      ]);
      
      toast({
        title: 'Paramètres sauvegardés',
        description: 'Tous les paramètres ont été mis à jour avec succès.',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la sauvegarde des paramètres.',
        variant: 'destructive',
      });
    } finally {
      setSettingsLoading(false);
    }
  };

  const logAdminAction = async (targetUserId: string, actionType: string, reason?: string, details?: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('admin_actions').insert({
        admin_user_id: user.id,
        target_user_id: targetUserId,
        action_type: actionType,
        reason,
        details
      });

      fetchAdminActions();
    } catch (error) {
      console.error('Error logging admin action:', error);
    }
  };

  const handleBanUser = async () => {
    if (!selectedUser || !banReason.trim()) return;
    
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          account_status: 'banned',
          banned_at: new Date().toISOString(),
          ban_reason: banReason.trim()
        })
        .eq('user_id', selectedUser.user_id);

      if (error) throw error;

      await logAdminAction(selectedUser.user_id, 'ban', banReason.trim());
      
      toast({
        title: 'Utilisateur banni',
        description: `L'utilisateur a été banni avec succès.`,
      });

      setBanDialogOpen(false);
      setBanReason('');
      setSelectedUser(null);
      fetchProfiles();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de bannir l\'utilisateur.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnbanUser = async (user: Profile) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          account_status: 'active',
          banned_at: null,
          ban_reason: null
        })
        .eq('user_id', user.user_id);

      if (error) throw error;

      await logAdminAction(user.user_id, 'unban');
      
      toast({
        title: 'Utilisateur débanni',
        description: 'L\'utilisateur peut à nouveau accéder à l\'application.',
      });

      fetchProfiles();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de débannir l\'utilisateur.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAccount = async (user: Profile) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce compte ? Cette action est irréversible.')) {
      return;
    }

    setActionLoading(true);
    try {
      // Delete user account via Supabase auth admin
      const { error } = await supabase.auth.admin.deleteUser(user.user_id);
      
      if (error) throw error;

      await logAdminAction(user.user_id, 'delete', 'Account deleted by admin');
      
      toast({
        title: 'Compte supprimé',
        description: 'Le compte utilisateur a été supprimé définitivement.',
      });

      fetchProfiles();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le compte.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendSMS = async () => {
    if (!selectedUser || !smsMessage.trim()) return;
    
    const phoneNumber = selectedUser.phone || selectedUser.agency_phone;
    if (!phoneNumber) {
      toast({
        title: 'Erreur',
        description: 'Aucun numéro de téléphone disponible pour cet utilisateur.',
        variant: 'destructive',
      });
      return;
    }

    setActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          to: phoneNumber,
          message: smsMessage.trim()
        }
      });

      if (error) throw error;

      await logAdminAction(selectedUser.user_id, 'message', 'SMS sent', { 
        phone: phoneNumber, 
        message: smsMessage.trim() 
      });
      
      toast({
        title: 'SMS envoyé',
        description: 'Le message a été envoyé avec succès.',
      });

      setSmsDialogOpen(false);
      setSmsMessage('');
      setSelectedUser(null);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer le SMS.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeUserRole = async () => {
    if (!selectedUser || !selectedRole) return;

    setActionLoading(true);
    try {
      if (selectedRole === 'remove') {
        // Remove all roles
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', selectedUser.user_id);

        if (error) throw error;

        await logAdminAction(selectedUser.user_id, 'demote', 'All roles removed');
        
        toast({
          title: 'Rôles supprimés',
          description: 'Tous les rôles ont été supprimés de cet utilisateur.',
        });
      } else {
        // Add new role
        const { error } = await supabase.from('user_roles').insert({
          user_id: selectedUser.user_id,
          role: selectedRole as 'admin' | 'moderator'
        });

        if (error) throw error;

        await logAdminAction(selectedUser.user_id, 'promote', `Role assigned: ${selectedRole}`);
        
        toast({
          title: 'Rôle assigné',
          description: `L'utilisateur a reçu le rôle ${selectedRole}.`,
        });
      }

      setRoleDialogOpen(false);
      setSelectedRole('');
      setSelectedUser(null);
      fetchUserRoles();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le rôle.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getUserRole = (userId: string) => {
    return userRoles.find(role => role.user_id === userId)?.role;
  };

  const getStatusBadgeVariant = (status?: string) => {
    switch (status) {
      case 'banned': return 'destructive';
      case 'suspended': return 'secondary';
      case 'active': 
      default: return 'default';
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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

          <Card>
            <CardContent className="p-4 text-center">
              <Ban className="w-8 h-8 text-destructive mx-auto mb-2" />
              <div className="text-2xl font-bold">{profiles.filter(p => p.account_status === 'banned').length}</div>
              <p className="text-sm text-muted-foreground">Comptes bannis</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="listings">Annonces</TabsTrigger>
            <TabsTrigger value="roles">Rôles</TabsTrigger>
            <TabsTrigger value="settings">Tarifs & Limites</TabsTrigger>
            <TabsTrigger value="actions">Historique</TabsTrigger>
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
          </TabsList>

          {/* Users Management Tab */}
          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Gestion des utilisateurs
                </CardTitle>
                <CardDescription>
                  Gérer les comptes, bannir, supprimer ou envoyer des messages
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Localisation</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Annonces</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {profile.user_type === 'agence' 
                                ? profile.agency_name 
                                : `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Utilisateur'
                              }
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {profile.phone || profile.agency_phone || 'Pas de téléphone'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={profile.user_type === 'agence' ? 'default' : 'secondary'}>
                            {profile.user_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {profile.city && profile.country 
                            ? `${profile.city}, ${profile.country}`
                            : 'Non spécifiée'
                          }
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(profile.account_status)}>
                            {profile.account_status || 'active'}
                          </Badge>
                        </TableCell>
                        <TableCell>{profile.listing_count || 0}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {profile.account_status === 'banned' ? (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleUnbanUser(profile)}
                                disabled={actionLoading}
                              >
                                <UserCheck className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedUser(profile);
                                  setBanDialogOpen(true);
                                }}
                                disabled={actionLoading}
                              >
                                <Ban className="w-4 h-4" />
                              </Button>
                            )}
                            
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedUser(profile);
                                setSmsDialogOpen(true);
                              }}
                              disabled={actionLoading || (!profile.phone && !profile.agency_phone)}
                            >
                              <MessageCircle className="w-4 h-4" />
                            </Button>
                            
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedUser(profile);
                                setRoleDialogOpen(true);
                              }}
                              disabled={actionLoading}
                            >
                              <Shield className="w-4 h-4" />
                            </Button>
                            
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDeleteAccount(profile)}
                              disabled={actionLoading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Listings Tab */}
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titre</TableHead>
                      <TableHead>Ville</TableHead>
                      <TableHead>Prix</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listings.map((listing) => (
                      <TableRow key={listing.id}>
                        <TableCell className="font-medium">{listing.title}</TableCell>
                        <TableCell>{listing.city}</TableCell>
                        <TableCell>{formatPrice(listing.price, listing.currency)}</TableCell>
                        <TableCell>
                          <Badge variant={listing.status === 'active' ? 'default' : 'secondary'}>
                            {listing.status === 'active' ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                            {listing.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(listing.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Tarifs & Limites d'annonces
                </CardTitle>
                <CardDescription>
                  Configurer les prix d'abonnement et les limites d'annonces gratuites
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Pricing Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Tarifs d'abonnement
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Prix abonnement mensuel (CFA)</label>
                      <Input
                        type="number"
                        value={monthlyPrice}
                        onChange={(e) => setMonthlyPrice(Number(e.target.value) || 0)}
                        min="0"
                        step="100"
                      />
                      <p className="text-xs text-muted-foreground">
                        Prix en centimes CFA (ex: 5000 = 50 F CFA)
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Prix par annonce (CFA)</label>
                      <Input
                        type="number"
                        value={perListingPrice}
                        onChange={(e) => setPerListingPrice(Number(e.target.value) || 0)}
                        min="0"
                        step="100"
                      />
                      <p className="text-xs text-muted-foreground">
                        Prix en centimes CFA (ex: 1000 = 10 F CFA)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Limits Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Limites d'annonces gratuites
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Particuliers</label>
                      <Input
                        type="number"
                        value={freeListingsIndividual}
                        onChange={(e) => setFreeListingsIndividual(Number(e.target.value) || 0)}
                        min="0"
                        max="100"
                      />
                      <p className="text-xs text-muted-foreground">
                        Nombre d'annonces gratuites pour les particuliers
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Démarcheurs</label>
                      <Input
                        type="number"
                        value={freeListingsCanvasser}
                        onChange={(e) => setFreeListingsCanvasser(Number(e.target.value) || 0)}
                        min="0"
                        max="100"
                      />
                      <p className="text-xs text-muted-foreground">
                        Nombre d'annonces gratuites pour les démarcheurs
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Agences</label>
                      <Input
                        type="number"
                        value={freeListingsAgency}
                        onChange={(e) => setFreeListingsAgency(Number(e.target.value) || 0)}
                        min="0"
                        max="100"
                      />
                      <p className="text-xs text-muted-foreground">
                        Nombre d'annonces gratuites pour les agences
                      </p>
                    </div>
                  </div>
                </div>

                {/* Preview Section */}
                <div className="border rounded-lg p-4 bg-muted/50">
                  <h4 className="font-medium mb-3">Aperçu des tarifs actuels</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Abonnement mensuel:</strong> {(monthlyPrice / 100).toFixed(0)} F CFA</p>
                      <p><strong>Prix par annonce:</strong> {(perListingPrice / 100).toFixed(0)} F CFA</p>
                    </div>
                    <div>
                      <p><strong>Annonces gratuites particuliers:</strong> {freeListingsIndividual}</p>
                      <p><strong>Annonces gratuites démarcheurs:</strong> {freeListingsCanvasser}</p>
                      <p><strong>Annonces gratuites agences:</strong> {freeListingsAgency}</p>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button 
                    onClick={handleUpdatePricing}
                    disabled={settingsLoading}
                    className="min-w-32"
                  >
                    {settingsLoading ? (
                      <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Settings className="w-4 h-4 mr-2" />
                    )}
                    Sauvegarder
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roles Tab */}
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Assigné le</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userRoles.map((userRole) => {
                      const profile = profiles.find(p => p.user_id === userRole.user_id);
                      return (
                        <TableRow key={userRole.id}>
                          <TableCell>
                            <div className="font-medium">
                              {profile?.user_type === 'agence' 
                                ? profile.agency_name 
                                : `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Utilisateur'
                              }
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={userRole.role === 'admin' ? 'destructive' : 'default'}>
                              {userRole.role === 'admin' && <Crown className="w-3 h-3 mr-1" />}
                              {userRole.role === 'moderator' && <Shield className="w-3 h-3 mr-1" />}
                              {userRole.role}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(userRole.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Actions History Tab */}
          <TabsContent value="actions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Historique des actions
                </CardTitle>
                <CardDescription>
                  Toutes les actions administratives effectuées
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Utilisateur ciblé</TableHead>
                      <TableHead>Raison</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminActions.map((action) => {
                      const targetProfile = profiles.find(p => p.user_id === action.target_user_id);
                      return (
                        <TableRow key={action.id}>
                          <TableCell>
                            <Badge variant={
                              action.action_type === 'ban' ? 'destructive' : 
                              action.action_type === 'delete' ? 'destructive' : 
                              'default'
                            }>
                              {action.action_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {targetProfile?.user_type === 'agence' 
                              ? targetProfile.agency_name 
                              : `${targetProfile?.first_name || ''} ${targetProfile?.last_name || ''}`.trim() || 'Utilisateur supprimé'
                            }
                          </TableCell>
                          <TableCell>{action.reason || '-'}</TableCell>
                          <TableCell>{new Date(action.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Statistiques détaillées
                </CardTitle>
                <CardDescription>
                  Vue d'ensemble des propriétés et statistiques de la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PropertyStats />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Ban User Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bannir l'utilisateur</DialogTitle>
            <DialogDescription>
              Cette action bannira l'utilisateur et l'empêchera d'accéder à l'application.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="Raison du bannissement..."
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleBanUser}
              disabled={actionLoading || !banReason.trim()}
            >
              Bannir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send SMS Dialog */}
      <Dialog open={smsDialogOpen} onOpenChange={setSmsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Envoyer un SMS</DialogTitle>
            <DialogDescription>
              Envoi d'un message vers {selectedUser?.phone || selectedUser?.agency_phone}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="Votre message..."
              value={smsMessage}
              onChange={(e) => setSmsMessage(e.target.value)}
              maxLength={160}
            />
            <div className="text-sm text-muted-foreground text-right">
              {smsMessage.length}/160 caractères
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSmsDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleSendSMS}
              disabled={actionLoading || !smsMessage.trim()}
            >
              <Phone className="w-4 h-4 mr-2" />
              Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gérer les rôles</DialogTitle>
            <DialogDescription>
              Modifier le rôle de l'utilisateur sélectionné
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrateur</SelectItem>
                <SelectItem value="moderator">Modérateur</SelectItem>
                <SelectItem value="remove">Supprimer tous les rôles</SelectItem>
              </SelectContent>
            </Select>
            {selectedUser && (
              <div className="text-sm text-muted-foreground">
                Rôle actuel: {getUserRole(selectedUser.user_id) || 'Aucun rôle spécial'}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleChangeUserRole}
              disabled={actionLoading || !selectedRole}
            >
              Modifier le rôle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;