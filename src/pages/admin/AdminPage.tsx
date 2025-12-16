import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  Home, 
  Flag, 
  Shield, 
  Star,
  Loader2,
  Search,
  Trash2,
  Ban,
  AlertTriangle,
  Mail,
  MessageCircle,
  UserPlus,
  Eye,
  Check,
  X,
  Clock,
  ChevronRight
} from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TabType = 'users' | 'properties' | 'reports' | 'admins' | 'sponsored';

interface UserData {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  created_at: string;
  is_banned?: boolean;
  warnings_count?: number;
}

interface PropertyData {
  id: string;
  title: string;
  price: number;
  city: string;
  is_active: boolean;
  is_sponsored: boolean;
  sponsored_until: string | null;
  created_at: string;
  user_id: string;
  owner_name?: string;
}

interface ReportData {
  id: string;
  property_id: string;
  property_title?: string;
  reporter_name?: string;
  reason: string;
  description: string | null;
  status: string;
  created_at: string;
}

interface AdminData {
  id: string;
  user_id: string;
  role: string;
  full_name: string | null;
  email: string;
  created_at: string;
}

const AdminPage = () => {
  const navigate = useNavigate();
  const { isAdmin, isModerator, loading: loadingRoles } = useAdmin();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data states
  const [users, setUsers] = useState<UserData[]>([]);
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [reports, setReports] = useState<ReportData[]>([]);
  const [admins, setAdmins] = useState<AdminData[]>([]);
  
  // Dialog states
  const [warningDialog, setWarningDialog] = useState<{ open: boolean; userId: string; userName: string }>({ open: false, userId: '', userName: '' });
  const [banDialog, setBanDialog] = useState<{ open: boolean; userId: string; userName: string }>({ open: false, userId: '', userName: '' });
  const [messageDialog, setMessageDialog] = useState<{ open: boolean; userId: string; userName: string; type: 'app' | 'email' }>({ open: false, userId: '', userName: '', type: 'app' });
  const [sponsorDialog, setSponsorDialog] = useState<{ open: boolean; propertyId: string; propertyTitle: string }>({ open: false, propertyId: '', propertyTitle: '' });
  const [addAdminDialog, setAddAdminDialog] = useState(false);
  
  // Form states
  const [warningReason, setWarningReason] = useState('');
  const [banReason, setBanReason] = useState('');
  const [banPermanent, setBanPermanent] = useState(false);
  const [banDays, setBanDays] = useState('7');
  const [messageContent, setMessageContent] = useState('');
  const [sponsorDays, setSponsorDays] = useState('30');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'admin' | 'moderator'>('moderator');

  useEffect(() => {
    if (!loadingRoles && !isAdmin && !isModerator) {
      navigate('/profile');
    }
  }, [loadingRoles, isAdmin, isModerator, navigate]);

  useEffect(() => {
    if (isAdmin || isModerator) {
      fetchData();
    }
  }, [activeTab, isAdmin, isModerator]);

  const fetchData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'users':
          await fetchUsers();
          break;
        case 'properties':
          await fetchProperties();
          break;
        case 'reports':
          await fetchReports();
          break;
        case 'admins':
          await fetchAdmins();
          break;
        case 'sponsored':
          await fetchSponsoredProperties();
          break;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;

    // Get emails from auth metadata - we'll use email from profile join
    const usersWithEmail = await Promise.all((profiles || []).map(async (profile) => {
      // Get ban status
      const { data: banData } = await supabase
        .from('user_bans')
        .select('id')
        .eq('user_id', profile.user_id)
        .eq('is_active', true)
        .maybeSingle();
      
      // Get warnings count
      const { count: warningsCount } = await supabase
        .from('user_warnings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.user_id);

      return {
        ...profile,
        email: '', // Will be filled from auth if available
        is_banned: !!banData,
        warnings_count: warningsCount || 0,
      };
    }));

    setUsers(usersWithEmail);
  };

  const fetchProperties = async () => {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        id, title, price, city, is_active, is_sponsored, sponsored_until, created_at, user_id,
        profiles:user_id (full_name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;

    const propertiesWithOwner = (data || []).map((p: any) => ({
      ...p,
      owner_name: p.profiles?.full_name || 'Inconnu',
    }));

    setProperties(propertiesWithOwner);
  };

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from('property_reports')
      .select(`
        *,
        properties:property_id (title),
        profiles:reporter_id (full_name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;

    const reportsWithDetails = (data || []).map((r: any) => ({
      ...r,
      property_title: r.properties?.title || 'Annonce supprimée',
      reporter_name: r.profiles?.full_name || 'Anonyme',
    }));

    setReports(reportsWithDetails);
  };

  const fetchAdmins = async () => {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        *,
        profiles:user_id (full_name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;

    const adminsWithDetails = (data || []).map((a: any) => ({
      ...a,
      full_name: a.profiles?.full_name || 'Inconnu',
      email: '',
    }));

    setAdmins(adminsWithDetails);
  };

  const fetchSponsoredProperties = async () => {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        id, title, price, city, is_active, is_sponsored, sponsored_until, created_at, user_id,
        profiles:user_id (full_name)
      `)
      .eq('is_sponsored', true)
      .order('sponsored_until', { ascending: false });
    
    if (error) throw error;

    const propertiesWithOwner = (data || []).map((p: any) => ({
      ...p,
      owner_name: p.profiles?.full_name || 'Inconnu',
    }));

    setProperties(propertiesWithOwner);
  };

  // Actions
  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) return;

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;

      setProperties(prev => prev.filter(p => p.id !== propertyId));
      toast({ title: 'Annonce supprimée' });
    } catch (error) {
      console.error('Error deleting property:', error);
      toast({ title: 'Erreur', variant: 'destructive' });
    }
  };

  const handleSendWarning = async () => {
    if (!warningReason.trim()) return;

    try {
      const { error } = await supabase
        .from('user_warnings')
        .insert({
          user_id: warningDialog.userId,
          admin_id: user?.id,
          reason: warningReason,
        });

      if (error) throw error;

      toast({ title: 'Avertissement envoyé' });
      setWarningDialog({ open: false, userId: '', userName: '' });
      setWarningReason('');
      fetchUsers();
    } catch (error) {
      console.error('Error sending warning:', error);
      toast({ title: 'Erreur', variant: 'destructive' });
    }
  };

  const handleBanUser = async () => {
    if (!banReason.trim()) return;

    try {
      const expiresAt = banPermanent 
        ? null 
        : new Date(Date.now() + parseInt(banDays) * 24 * 60 * 60 * 1000).toISOString();

      const { error } = await supabase
        .from('user_bans')
        .insert({
          user_id: banDialog.userId,
          admin_id: user?.id,
          reason: banReason,
          is_permanent: banPermanent,
          expires_at: expiresAt,
        });

      if (error) throw error;

      toast({ title: 'Utilisateur banni' });
      setBanDialog({ open: false, userId: '', userName: '' });
      setBanReason('');
      setBanPermanent(false);
      fetchUsers();
    } catch (error) {
      console.error('Error banning user:', error);
      toast({ title: 'Erreur', variant: 'destructive' });
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_bans')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) throw error;

      toast({ title: 'Bannissement levé' });
      fetchUsers();
    } catch (error) {
      console.error('Error unbanning user:', error);
      toast({ title: 'Erreur', variant: 'destructive' });
    }
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim()) return;

    try {
      if (messageDialog.type === 'app') {
        const { error } = await supabase
          .from('messages')
          .insert({
            sender_id: user?.id,
            receiver_id: messageDialog.userId,
            content: messageContent,
          });

        if (error) throw error;
      } else {
        // Send email via edge function
        const { error } = await supabase.functions.invoke('send-admin-message', {
          body: {
            userId: messageDialog.userId,
            message: messageContent,
          },
        });

        if (error) throw error;
      }

      toast({ title: 'Message envoyé' });
      setMessageDialog({ open: false, userId: '', userName: '', type: 'app' });
      setMessageContent('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({ title: 'Erreur', variant: 'destructive' });
    }
  };

  const handleSponsorProperty = async () => {
    try {
      const sponsoredUntil = new Date(Date.now() + parseInt(sponsorDays) * 24 * 60 * 60 * 1000).toISOString();

      const { error } = await supabase
        .from('properties')
        .update({
          is_sponsored: true,
          sponsored_until: sponsoredUntil,
          sponsored_by: user?.id,
        })
        .eq('id', sponsorDialog.propertyId);

      if (error) throw error;

      toast({ title: 'Annonce sponsorisée' });
      setSponsorDialog({ open: false, propertyId: '', propertyTitle: '' });
      fetchProperties();
    } catch (error) {
      console.error('Error sponsoring property:', error);
      toast({ title: 'Erreur', variant: 'destructive' });
    }
  };

  const handleRemoveSponsor = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({
          is_sponsored: false,
          sponsored_until: null,
          sponsored_by: null,
        })
        .eq('id', propertyId);

      if (error) throw error;

      toast({ title: 'Sponsoring retiré' });
      if (activeTab === 'sponsored') {
        fetchSponsoredProperties();
      } else {
        fetchProperties();
      }
    } catch (error) {
      console.error('Error removing sponsor:', error);
      toast({ title: 'Erreur', variant: 'destructive' });
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) return;

    try {
      // Find user by email
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .limit(100);

      if (profileError) throw profileError;

      // We need to find the user by their auth email - this is tricky
      // For now, we'll need to have the admin enter the user_id directly or use another method
      toast({ 
        title: 'Fonctionnalité limitée', 
        description: 'Veuillez contacter le support pour ajouter un administrateur.',
      });
      
      setAddAdminDialog(false);
      setNewAdminEmail('');
    } catch (error) {
      console.error('Error adding admin:', error);
      toast({ title: 'Erreur', variant: 'destructive' });
    }
  };

  const handleRemoveAdmin = async (roleId: string, userId: string) => {
    if (userId === user?.id) {
      toast({ title: 'Vous ne pouvez pas vous retirer vous-même', variant: 'destructive' });
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir retirer ce rôle ?')) return;

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      toast({ title: 'Rôle retiré' });
      fetchAdmins();
    } catch (error) {
      console.error('Error removing admin:', error);
      toast({ title: 'Erreur', variant: 'destructive' });
    }
  };

  const handleReportAction = async (reportId: string, action: 'resolved' | 'dismissed') => {
    try {
      const { error } = await supabase
        .from('property_reports')
        .update({
          status: action,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', reportId);

      if (error) throw error;

      toast({ title: action === 'resolved' ? 'Signalement résolu' : 'Signalement rejeté' });
      fetchReports();
    } catch (error) {
      console.error('Error updating report:', error);
      toast({ title: 'Erreur', variant: 'destructive' });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    toast({ 
      title: 'Action non disponible', 
      description: 'La suppression d\'utilisateur nécessite une action côté serveur.',
      variant: 'destructive' 
    });
  };

  const tabs = [
    { id: 'users' as TabType, label: 'Utilisateurs', icon: Users },
    { id: 'properties' as TabType, label: 'Annonces', icon: Home },
    { id: 'reports' as TabType, label: 'Signalements', icon: Flag },
    { id: 'sponsored' as TabType, label: 'Sponsorisés', icon: Star },
    ...(isAdmin ? [{ id: 'admins' as TabType, label: 'Admins', icon: Shield }] : []),
  ];

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      spam: 'Spam',
      inappropriate_content: 'Contenu inapproprié',
      fraud: 'Fraude',
      false_info: 'Fausse information',
      other: 'Autre',
    };
    return labels[reason] || reason;
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.phone?.includes(searchQuery)
  );

  const filteredProperties = properties.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loadingRoles) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin && !isModerator) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-primary to-primary/80 pt-12 pb-6 px-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Administration</h1>
            <p className="text-white/70 text-sm">Gestion de l'application</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher..."
            className="pl-10 bg-white/90"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 -mt-3">
        <div className="bg-card rounded-xl shadow-sm p-1 flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-0 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="truncate">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 mt-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-3">
                {filteredUsers.map((userData) => (
                  <div key={userData.id} className="bg-card rounded-xl p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium truncate">{userData.full_name || 'Sans nom'}</h3>
                          {userData.is_banned && (
                            <Badge variant="destructive" className="text-xs">Banni</Badge>
                          )}
                          {(userData.warnings_count || 0) > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {userData.warnings_count} avert.
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{userData.phone}</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setMessageDialog({ open: true, userId: userData.user_id, userName: userData.full_name || '', type: 'app' })}
                          className="p-2 rounded-lg hover:bg-muted transition-colors"
                          title="Message"
                        >
                          <MessageCircle className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => setWarningDialog({ open: true, userId: userData.user_id, userName: userData.full_name || '' })}
                          className="p-2 rounded-lg hover:bg-muted transition-colors"
                          title="Avertissement"
                        >
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                        </button>
                        {userData.is_banned ? (
                          <button
                            onClick={() => handleUnbanUser(userData.user_id)}
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                            title="Débannir"
                          >
                            <Check className="w-4 h-4 text-green-500" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setBanDialog({ open: true, userId: userData.user_id, userName: userData.full_name || '' })}
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                            title="Bannir"
                          >
                            <Ban className="w-4 h-4 text-destructive" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {filteredUsers.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Aucun utilisateur trouvé</p>
                )}
              </div>
            )}

            {/* Properties Tab */}
            {activeTab === 'properties' && (
              <div className="space-y-3">
                {filteredProperties.map((property) => (
                  <div key={property.id} className="bg-card rounded-xl p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium truncate">{property.title}</h3>
                          {property.is_sponsored && (
                            <Badge className="text-xs bg-amber-500">Sponsorisé</Badge>
                          )}
                          {!property.is_active && (
                            <Badge variant="secondary" className="text-xs">Inactif</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{property.city} • {property.owner_name}</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => navigate(`/property/${property.id}`)}
                          className="p-2 rounded-lg hover:bg-muted transition-colors"
                          title="Voir"
                        >
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </button>
                        {property.is_sponsored ? (
                          <button
                            onClick={() => handleRemoveSponsor(property.id)}
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                            title="Retirer sponsoring"
                          >
                            <X className="w-4 h-4 text-amber-500" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setSponsorDialog({ open: true, propertyId: property.id, propertyTitle: property.title })}
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                            title="Sponsoriser"
                          >
                            <Star className="w-4 h-4 text-amber-500" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteProperty(property.id)}
                          className="p-2 rounded-lg hover:bg-muted transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredProperties.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Aucune annonce trouvée</p>
                )}
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div className="space-y-3">
                {reports.filter(r => r.status === 'pending').length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-medium text-sm text-muted-foreground mb-2">En attente</h3>
                    {reports.filter(r => r.status === 'pending').map((report) => (
                      <div key={report.id} className="bg-card rounded-xl p-4 shadow-sm mb-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{report.property_title}</h3>
                            <Badge variant="outline" className="mt-1">{getReasonLabel(report.reason)}</Badge>
                            {report.description && (
                              <p className="text-sm text-muted-foreground mt-2">{report.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">Par {report.reporter_name}</p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => navigate(`/property/${report.property_id}`)}
                              className="p-2 rounded-lg hover:bg-muted transition-colors"
                              title="Voir l'annonce"
                            >
                              <Eye className="w-4 h-4 text-muted-foreground" />
                            </button>
                            <button
                              onClick={() => handleReportAction(report.id, 'resolved')}
                              className="p-2 rounded-lg hover:bg-muted transition-colors"
                              title="Résoudre"
                            >
                              <Check className="w-4 h-4 text-green-500" />
                            </button>
                            <button
                              onClick={() => handleReportAction(report.id, 'dismissed')}
                              className="p-2 rounded-lg hover:bg-muted transition-colors"
                              title="Rejeter"
                            >
                              <X className="w-4 h-4 text-destructive" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {reports.filter(r => r.status !== 'pending').length > 0 && (
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-2">Traités</h3>
                    {reports.filter(r => r.status !== 'pending').map((report) => (
                      <div key={report.id} className="bg-card rounded-xl p-4 shadow-sm mb-3 opacity-60">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{report.property_title}</h3>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline">{getReasonLabel(report.reason)}</Badge>
                              <Badge variant={report.status === 'resolved' ? 'default' : 'secondary'}>
                                {report.status === 'resolved' ? 'Résolu' : 'Rejeté'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {reports.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Aucun signalement</p>
                )}
              </div>
            )}

            {/* Sponsored Tab */}
            {activeTab === 'sponsored' && (
              <div className="space-y-3">
                {properties.map((property) => (
                  <div key={property.id} className="bg-card rounded-xl p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{property.title}</h3>
                        <p className="text-sm text-muted-foreground">{property.city}</p>
                        {property.sponsored_until && (
                          <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Jusqu'au {new Date(property.sponsored_until).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveSponsor(property.id)}
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                        title="Retirer sponsoring"
                      >
                        <X className="w-4 h-4 text-amber-500" />
                      </button>
                    </div>
                  </div>
                ))}
                {properties.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Aucune annonce sponsorisée</p>
                )}
              </div>
            )}

            {/* Admins Tab */}
            {activeTab === 'admins' && isAdmin && (
              <div className="space-y-3">
                <Button
                  onClick={() => setAddAdminDialog(true)}
                  className="w-full"
                  variant="outline"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Ajouter un administrateur
                </Button>
                
                {admins.map((admin) => (
                  <div key={admin.id} className="bg-card rounded-xl p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium truncate">{admin.full_name}</h3>
                          <Badge variant={admin.role === 'admin' ? 'default' : 'secondary'}>
                            {admin.role === 'admin' ? 'Admin' : 'Modérateur'}
                          </Badge>
                        </div>
                      </div>
                      {admin.user_id !== user?.id && (
                        <button
                          onClick={() => handleRemoveAdmin(admin.id, admin.user_id)}
                          className="p-2 rounded-lg hover:bg-muted transition-colors"
                          title="Retirer"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Warning Dialog */}
      <Dialog open={warningDialog.open} onOpenChange={(open) => setWarningDialog({ ...warningDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Envoyer un avertissement</DialogTitle>
            <DialogDescription>
              Avertissement pour {warningDialog.userName}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={warningReason}
            onChange={(e) => setWarningReason(e.target.value)}
            placeholder="Raison de l'avertissement..."
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setWarningDialog({ open: false, userId: '', userName: '' })}>
              Annuler
            </Button>
            <Button onClick={handleSendWarning} disabled={!warningReason.trim()}>
              Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban Dialog */}
      <Dialog open={banDialog.open} onOpenChange={(open) => setBanDialog({ ...banDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bannir l'utilisateur</DialogTitle>
            <DialogDescription>
              Bannir {banDialog.userName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Raison du bannissement..."
              rows={3}
            />
            <div className="flex items-center justify-between">
              <Label htmlFor="permanent">Bannissement permanent</Label>
              <Switch
                id="permanent"
                checked={banPermanent}
                onCheckedChange={setBanPermanent}
              />
            </div>
            {!banPermanent && (
              <div>
                <Label>Durée (jours)</Label>
                <Select value={banDays} onValueChange={setBanDays}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 jour</SelectItem>
                    <SelectItem value="7">7 jours</SelectItem>
                    <SelectItem value="30">30 jours</SelectItem>
                    <SelectItem value="90">90 jours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialog({ open: false, userId: '', userName: '' })}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleBanUser} disabled={!banReason.trim()}>
              Bannir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={messageDialog.open} onOpenChange={(open) => setMessageDialog({ ...messageDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Envoyer un message</DialogTitle>
            <DialogDescription>
              Message pour {messageDialog.userName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={messageDialog.type === 'app' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMessageDialog({ ...messageDialog, type: 'app' })}
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                App
              </Button>
              <Button
                variant={messageDialog.type === 'email' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMessageDialog({ ...messageDialog, type: 'email' })}
              >
                <Mail className="w-4 h-4 mr-1" />
                Email
              </Button>
            </div>
            <Textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Votre message..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMessageDialog({ open: false, userId: '', userName: '', type: 'app' })}>
              Annuler
            </Button>
            <Button onClick={handleSendMessage} disabled={!messageContent.trim()}>
              Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sponsor Dialog */}
      <Dialog open={sponsorDialog.open} onOpenChange={(open) => setSponsorDialog({ ...sponsorDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sponsoriser l'annonce</DialogTitle>
            <DialogDescription>
              {sponsorDialog.propertyTitle}
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label>Durée du sponsoring</Label>
            <Select value={sponsorDays} onValueChange={setSponsorDays}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 jours</SelectItem>
                <SelectItem value="14">14 jours</SelectItem>
                <SelectItem value="30">30 jours</SelectItem>
                <SelectItem value="60">60 jours</SelectItem>
                <SelectItem value="90">90 jours</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSponsorDialog({ open: false, propertyId: '', propertyTitle: '' })}>
              Annuler
            </Button>
            <Button onClick={handleSponsorProperty}>
              <Star className="w-4 h-4 mr-1" />
              Sponsoriser
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Admin Dialog */}
      <Dialog open={addAdminDialog} onOpenChange={setAddAdminDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un administrateur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Email de l'utilisateur</Label>
              <Input
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="email@example.com"
                type="email"
              />
            </div>
            <div>
              <Label>Rôle</Label>
              <Select value={newAdminRole} onValueChange={(v) => setNewAdminRole(v as 'admin' | 'moderator')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="moderator">Modérateur</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddAdminDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddAdmin} disabled={!newAdminEmail.trim()}>
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;
