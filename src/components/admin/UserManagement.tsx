import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Users, Ban, UserCheck, UserX, Mail, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  user_type: string | null;
  account_status: string | null;
  created_at: string;
}

export const UserManagement: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les utilisateurs.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ account_status: 'banned' })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: 'Utilisateur banni',
        description: 'L\'utilisateur a été banni avec succès.',
      });
      
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error banning user:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de bannir l\'utilisateur.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ account_status: 'active' })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: 'Utilisateur débanni',
        description: 'L\'utilisateur a été débanni avec succès.',
      });
      
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error unbanning user:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de débannir l\'utilisateur.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'banned':
        return <Badge variant="destructive">Banni</Badge>;
      case 'active':
        return <Badge variant="default">Actif</Badge>;
      case 'suspended':
        return <Badge variant="secondary">Suspendu</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const getUserTypeBadge = (userType: string | null) => {
    switch (userType) {
      case 'particulier':
        return <Badge variant="outline">Particulier</Badge>;
      case 'agence':
        return <Badge variant="secondary">Agence</Badge>;
      case 'démarcheur':
        return <Badge variant="default">Démarcheur</Badge>;
      default:
        return <Badge variant="outline">Non défini</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <CardTitle>Gestion des utilisateurs</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Localisation</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Inscription</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {user.first_name && user.last_name 
                          ? `${user.first_name} ${user.last_name}`
                          : 'Nom non défini'
                        }
                      </div>
                      <div className="text-sm text-muted-foreground">ID: {user.user_id.slice(0, 8)}...</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {user.email && (
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                      )}
                      {user.phone && (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="w-3 h-3" />
                          {user.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {user.city && user.country ? `${user.city}, ${user.country}` : 'Non définie'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getUserTypeBadge(user.user_type)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(user.account_status)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(user.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {user.account_status === 'banned' ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={actionLoading === user.user_id}
                            >
                              <UserCheck className="w-4 h-4 mr-1" />
                              Débannir
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Débannir l'utilisateur</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir débannir cet utilisateur ? Il pourra à nouveau accéder à l'application.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleUnbanUser(user.user_id)}>
                                Débannir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={actionLoading === user.user_id}
                            >
                              <Ban className="w-4 h-4 mr-1" />
                              Bannir
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Bannir l'utilisateur</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir bannir cet utilisateur ? Il ne pourra plus accéder à l'application.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleBanUser(user.user_id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Bannir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {users.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <UserX className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucun utilisateur trouvé.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};