import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const AccountManagementPage = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = async () => {
    if (confirmText !== 'SUPPRIMER') {
      toast({ title: 'Veuillez taper SUPPRIMER pour confirmer', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // Delete user data from profiles
      await supabase.from('profiles').delete().eq('user_id', user?.id);
      
      // Delete user properties
      await supabase.from('properties').delete().eq('user_id', user?.id);
      
      // Sign out
      await signOut();
      
      toast({ title: 'Compte supprimé', description: 'Votre compte a été supprimé avec succès.' });
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({ 
        title: 'Erreur', 
        description: 'Impossible de supprimer le compte. Contactez le support.',
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-32">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-primary to-primary/80 text-primary-foreground">
        <div className="flex items-center gap-4 px-4 py-4">
          <button 
            onClick={() => navigate('/profile')}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Gestion du compte</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Account Info */}
        <div className="bg-card rounded-2xl p-4">
          <h2 className="font-semibold mb-4">Informations du compte</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">ID Utilisateur</span>
              <span className="text-sm font-medium truncate max-w-[150px]">{user?.id}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Membre depuis</span>
              <span className="text-sm font-medium">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-destructive" />
            <h2 className="font-semibold text-destructive">Zone dangereuse</h2>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            La suppression de votre compte est irréversible. Toutes vos données, annonces et messages seront définitivement supprimés.
          </p>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer mon compte
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Toutes vos données seront définitivement supprimées.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-4">
                <Label htmlFor="confirm" className="text-sm">
                  Tapez <strong>SUPPRIMER</strong> pour confirmer
                </Label>
                <Input
                  id="confirm"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="SUPPRIMER"
                  className="mt-2"
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={confirmText !== 'SUPPRIMER' || loading}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Supprimer définitivement
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

export default AccountManagementPage;
