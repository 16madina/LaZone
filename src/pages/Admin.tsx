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
  XCircle,
  UserX,
  Shield,
  MessageSquare,
  Trash2,
  ShieldAlert,
  UserCheck,
  Phone,
  Mail,
  MapPin,
  MoreHorizontal,
  Edit
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  account_status?: string;
  banned_at?: string;
  ban_reason?: string;
  phone?: string;
  agency_phone?: string;
  responsible_mobile?: string;
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
  
  // Dialog states
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showSmsDialog, setShowSmsDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  
  // Form states
  const [banReason, setBanReason] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'moderator' | 'user'>('user');

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

  // Admin actions
  const handleBanUser = async () => {
    if (!selectedProfile || !banReason.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('profiles')
        .update({
          account_status: 'banned',
          banned_at: new Date().toISOString(),
          ban_reason: banReason,
          banned_by: user.id
        })
        .eq('user_id', selectedProfile.user_id);

      await supabase
        .from('admin_actions')
        .insert({
          admin_user_id: user.id,
          target_user_id: selectedProfile.user_id,
          action_type: 'ban',
          reason: banReason
        });

      toast({
        title: 'Utilisateur banni',
        description: 'L\'utilisateur a été banni avec succès.',
      });

      setShowBanDialog(false);
      setBanReason('');
      setSelectedProfile(null);
      fetchProfiles();
    } catch (error) {
      console.error('Error banning user:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de bannir l\'utilisateur.',
        variant: 'destructive'
      });
    }
  };

  const handleUnbanUser = async (profile: Profile) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('profiles')
        .update({
          account_status: 'active',
          banned_at: null,
          ban_reason: null,
          banned_by: null
        })
        .eq('user_id', profile.user_id);

      await supabase
        .from('admin_actions')
        .insert({
          admin_user_id: user.id,
          target_user_id: profile.user_id,
          action_type: 'unban'
        });

      toast({
        title: 'Utilisateur débanni',
        description: 'L\'utilisateur a été débanni avec succès.',
      });

      fetchProfiles();
    } catch (error) {
      console.error('Error unbanning user:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de débannir l\'utilisateur.',
        variant: 'destructive'
      });
    }
  };

  const handleSendSMS = async () => {
    if (!selectedProfile || !smsMessage.trim()) return;

    try {
      const phoneNumber = selectedProfile.phone || selectedProfile.agency_phone || selectedProfile.responsible_mobile;
      
      if (!phoneNumber) {
        toast({
          title: 'Erreur',
          description: 'Aucun numéro de téléphone trouvé pour cet utilisateur.',
          variant: 'destructive'
        });
        return;
      }

      const { error } = await supabase.functions.invoke('send-sms', {
        body: {
          to: phoneNumber,
          message: smsMessage
        }
      });

      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('admin_actions')
          .insert({
            admin_user_id: user.id,
            target_user_id: selectedProfile.user_id,
            action_type: 'message',
            details: { message: smsMessage, phone: phoneNumber }
          });
      }

      toast({
        title: 'SMS envoyé',
        description: 'Le message a été envoyé avec succès.',
      });

      setShowSmsDialog(false);
      setSmsMessage('');
      setSelectedProfile(null);
    } catch (error) {
      console.error('Error sending SMS:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer le SMS.',
        variant: 'destructive'
      });
    }
  };

  const handleChangeRole = async () => {
    if (!selectedProfile || !selectedRole) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Remove existing roles
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', selectedProfile.user_id);

      // Add new role if not 'user'
      if (selectedRole !== 'user') {
        await supabase
          .from('user_roles')
          .insert({
            user_id: selectedProfile.user_id,
            role: selectedRole as 'admin' | 'moderator'
          });
      }

      await supabase
        .from('admin_actions')
        .insert({
          admin_user_id: user.id,
          target_user_id: selectedProfile.user_id,
          action_type: selectedRole === 'user' ? 'demote' : 'promote',
          details: { new_role: selectedRole }
        });

      toast({
        title: 'Rôle modifié',
        description: `L'utilisateur est maintenant ${selectedRole}.`,
      });

      setShowRoleDialog(false);
      setSelectedRole('user');
      setSelectedProfile(null);
      fetchUserRoles();
      fetchProfiles();
    } catch (error) {
      console.error('Error changing role:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le rôle.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!selectedProfile) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Log the action before deleting
      await supabase
        .from('admin_actions')
        .insert({
          admin_user_id: user.id,
          target_user_id: selectedProfile.user_id,
          action_type: 'delete'
        });

      // Delete user data (cascade will handle related data)
      await supabase.auth.admin.deleteUser(selectedProfile.user_id);

      toast({
        title: 'Compte supprimé',
        description: 'Le compte utilisateur a été supprimé définitivement.',
      });

      setShowDeleteDialog(false);
      setSelectedProfile(null);
      fetchProfiles();
      fetchUserRoles();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le compte.',
        variant: 'destructive'
      });
    }
  };

  const getUserRole = (userId: string) => {
    const role = userRoles.find(r => r.user_id === userId);
    return role?.role || 'user';
  };

  const getPhoneNumber = (profile: Profile) => {
    return profile.phone || profile.agency_phone || profile.responsible_mobile || 'Non renseigné';
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
                    <div key={profile.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 font-medium">
                          {profile.user_type === 'agence' 
                            ? profile.agency_name 
                            : `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Utilisateur'
                          }
                          {profile.account_status === 'banned' && (
                            <Badge variant="destructive" className="text-xs">
                              <UserX className="w-3 h-3 mr-1" />
                              Banni
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {profile.city && profile.country 
                              ? `${profile.city}, ${profile.country}`
                              : 'Localisation non spécifiée'
                            }
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {getPhoneNumber(profile)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={profile.user_type === 'agence' ? 'default' : 'secondary'}>
                            {profile.user_type}
                          </Badge>
                          <Badge variant="outline">
                            {getUserRole(profile.user_id)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {profile.listing_count || 0} annonces
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedProfile(profile);
                                setShowProfileDialog(true);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Voir le profil
                            </DropdownMenuItem>
                            {profile.account_status === 'banned' ? (
                              <DropdownMenuItem
                                onClick={() => handleUnbanUser(profile)}
                                className="text-green-600"
                              >
                                <UserCheck className="w-4 h-4 mr-2" />
                                Débannir
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedProfile(profile);
                                  setShowBanDialog(true);
                                }}
                                className="text-yellow-600"
                              >
                                <ShieldAlert className="w-4 h-4 mr-2" />
                                Bannir
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedProfile(profile);
                                setSelectedRole(getUserRole(profile.user_id) as 'admin' | 'moderator' | 'user');
                                setShowRoleDialog(true);
                              }}
                            >
                              <Shield className="w-4 h-4 mr-2" />
                              Changer le rôle
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedProfile(profile);
                                setShowSmsDialog(true);
                              }}
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Envoyer SMS
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedProfile(profile);
                                setShowDeleteDialog(true);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

      {/* Dialogs */}
      {/* Ban User Dialog */}
      <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bannir l'utilisateur</DialogTitle>
            <DialogDescription>
              Cette action bannira définitivement l'utilisateur. Il ne pourra plus se connecter à son compte.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="ban-reason">Raison du bannissement</Label>
              <Textarea
                id="ban-reason"
                placeholder="Expliquez la raison du bannissement..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowBanDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleBanUser} disabled={!banReason.trim()}>
              Bannir
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* SMS Dialog */}
      <Dialog open={showSmsDialog} onOpenChange={setShowSmsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Envoyer un SMS</DialogTitle>
            <DialogDescription>
              Envoyez un message SMS à {selectedProfile?.first_name || selectedProfile?.agency_name || 'cet utilisateur'}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sms-message">Message</Label>
              <Textarea
                id="sms-message"
                placeholder="Tapez votre message..."
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                maxLength={160}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {smsMessage.length}/160 caractères
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowSmsDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSendSMS} disabled={!smsMessage.trim()}>
              Envoyer SMS
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Role Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le rôle</DialogTitle>
            <DialogDescription>
              Changez le rôle de {selectedProfile?.first_name || selectedProfile?.agency_name || 'cet utilisateur'}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="role-select">Nouveau rôle</Label>
              <Select 
                value={selectedRole} 
                onValueChange={(value: 'admin' | 'moderator' | 'user') => setSelectedRole(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Utilisateur</SelectItem>
                  <SelectItem value="moderator">Modérateur</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleChangeRole} disabled={!selectedRole}>
              Modifier le rôle
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Details Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Profil de l'utilisateur</DialogTitle>
            <DialogDescription>
              Informations détaillées de l'utilisateur
            </DialogDescription>
          </DialogHeader>
          {selectedProfile && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nom complet</Label>
                <p className="text-sm font-medium">
                  {selectedProfile.user_type === 'agence' 
                    ? selectedProfile.agency_name 
                    : `${selectedProfile.first_name || ''} ${selectedProfile.last_name || ''}`.trim() || 'Non renseigné'
                  }
                </p>
              </div>
              <div>
                <Label>Type de compte</Label>
                <p className="text-sm font-medium">{selectedProfile.user_type}</p>
              </div>
              <div>
                <Label>Statut du compte</Label>
                <Badge variant={selectedProfile.account_status === 'banned' ? 'destructive' : 'default'}>
                  {selectedProfile.account_status || 'active'}
                </Badge>
              </div>
              <div>
                <Label>Rôle</Label>
                <p className="text-sm font-medium">{getUserRole(selectedProfile.user_id)}</p>
              </div>
              <div>
                <Label>Pays</Label>
                <p className="text-sm font-medium">{selectedProfile.country || 'Non renseigné'}</p>
              </div>
              <div>
                <Label>Ville</Label>
                <p className="text-sm font-medium">{selectedProfile.city || 'Non renseigné'}</p>
              </div>
              <div>
                <Label>Téléphone</Label>
                <p className="text-sm font-medium">{getPhoneNumber(selectedProfile)}</p>
              </div>
              <div>
                <Label>Nombre d'annonces</Label>
                <p className="text-sm font-medium">{selectedProfile.listing_count || 0}</p>
              </div>
              {selectedProfile.account_status === 'banned' && (
                <>
                  <div>
                    <Label>Banni le</Label>
                    <p className="text-sm font-medium">
                      {selectedProfile.banned_at ? new Date(selectedProfile.banned_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <Label>Raison du bannissement</Label>
                    <p className="text-sm font-medium">{selectedProfile.ban_reason || 'Aucune raison spécifiée'}</p>
                  </div>
                </>
              )}
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={() => setShowProfileDialog(false)}>
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cela supprimera définitivement le compte de l'utilisateur
              et toutes ses données associées (annonces, favoris, etc.).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;