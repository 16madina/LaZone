import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Home, Trash2, Eye, MapPin, DollarSign, Calendar, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Listing {
  id: string;
  title: string;
  price: number;
  currency: string;
  purpose: string;
  property_type: string;
  status: string;
  city: string;
  country: string;
  neighborhood: string | null;
  created_at: string;
  user_id: string;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
}

export const ListingManagement: React.FC = () => {
  const { toast } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings((data as any) || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les annonces.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    setActionLoading(listingId);
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId);

      if (error) throw error;

      toast({
        title: 'Annonce supprimée',
        description: 'L\'annonce a été supprimée avec succès.',
      });
      
      fetchListings(); // Refresh the list
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'annonce.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateStatus = async (listingId: string, newStatus: string) => {
    setActionLoading(listingId);
    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: newStatus })
        .eq('id', listingId);

      if (error) throw error;

      toast({
        title: 'Statut mis à jour',
        description: `L'annonce a été ${newStatus === 'active' ? 'activée' : 'désactivée'}.`,
      });
      
      fetchListings(); // Refresh the list
    } catch (error) {
      console.error('Error updating listing status:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le statut.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Actif</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactif</Badge>;
      case 'pending':
        return <Badge variant="outline">En attente</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeté</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPurposeBadge = (purpose: string) => {
    switch (purpose) {
      case 'sale':
        return <Badge variant="default">Vente</Badge>;
      case 'rent':
        return <Badge variant="secondary">Location</Badge>;
      default:
        return <Badge variant="outline">{purpose}</Badge>;
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' ' + currency;
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
          <Home className="w-5 h-5 text-primary" />
          <CardTitle>Gestion des annonces</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Annonce</TableHead>
                <TableHead>Propriétaire</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Localisation</TableHead>
                <TableHead>Type/But</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Créée le</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium max-w-[200px] truncate">{listing.title}</div>
                      <div className="text-sm text-muted-foreground">ID: {listing.id.slice(0, 8)}...</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <div className="text-sm">
                        {listing.profiles?.first_name && listing.profiles?.last_name 
                          ? `${listing.profiles.first_name} ${listing.profiles.last_name}`
                          : listing.profiles?.email || 'Utilisateur inconnu'
                        }
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      <div className="font-medium">{formatPrice(listing.price, listing.currency)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <div className="text-sm">
                        {listing.city}, {listing.country}
                        {listing.neighborhood && (
                          <div className="text-muted-foreground">{listing.neighborhood}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {getPurposeBadge(listing.purpose)}
                      <div className="text-xs text-muted-foreground">{listing.property_type}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(listing.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <div className="text-sm">
                        {new Date(listing.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/property/${listing.id}`, '_blank')}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      
                      {listing.status === 'active' ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={actionLoading === listing.id}
                          onClick={() => handleUpdateStatus(listing.id, 'inactive')}
                        >
                          Désactiver
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={actionLoading === listing.id}
                          onClick={() => handleUpdateStatus(listing.id, 'active')}
                        >
                          Activer
                        </Button>
                      )}

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={actionLoading === listing.id}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer l'annonce</AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteListing(listing.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {listings.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Home className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucune annonce trouvée.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};