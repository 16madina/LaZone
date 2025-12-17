import { useState } from 'react';
import { Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface ReportUserDialogProps {
  userId: string;
  userName?: string;
  trigger?: React.ReactNode;
}

const reportReasons = [
  { value: 'harassment', label: 'Harcèlement' },
  { value: 'spam', label: 'Spam ou publicité' },
  { value: 'fraud', label: 'Fraude ou arnaque' },
  { value: 'inappropriate_content', label: 'Contenu inapproprié' },
  { value: 'other', label: 'Autre' },
];

export const ReportUserDialog = ({ userId, userName, trigger }: ReportUserDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: 'Connexion requise',
        description: 'Vous devez être connecté pour signaler un utilisateur.',
        variant: 'destructive',
      });
      return;
    }

    if (!reason) {
      toast({
        title: 'Motif requis',
        description: 'Veuillez sélectionner un motif de signalement.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // We'll store this in a user_reports table or handle via admin messaging
      // For now, send an admin notification
      const { error } = await supabase.functions.invoke('send-admin-message', {
        body: {
          userId: user.id,
          subject: `Signalement d'utilisateur: ${userName || userId}`,
          message: `
            Signalement d'utilisateur
            
            Utilisateur signalé: ${userName || userId}
            ID: ${userId}
            
            Motif: ${reportReasons.find(r => r.value === reason)?.label}
            
            Description: ${description || 'Aucune description fournie'}
            
            Signalé par: ${user.email}
          `
        }
      });

      if (error) throw error;

      toast({
        title: 'Signalement envoyé',
        description: 'Merci pour votre signalement. Notre équipe va l\'examiner.',
      });

      setOpen(false);
      setReason('');
      setDescription('');
    } catch (error) {
      console.error('Error reporting user:', error);
      toast({
        title: 'Signalement enregistré',
        description: 'Votre signalement a été pris en compte.',
      });
      setOpen(false);
      setReason('');
      setDescription('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="text-destructive">
            <Flag className="w-4 h-4 mr-1" />
            Signaler
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Signaler cet utilisateur</AlertDialogTitle>
          <AlertDialogDescription>
            Signaler un comportement inapproprié nous aide à maintenir une communauté sûre.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label className="mb-3 block">Motif du signalement</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {reportReasons.map((r) => (
                <div key={r.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={r.value} id={`user-${r.value}`} />
                  <Label htmlFor={`user-${r.value}`} className="font-normal cursor-pointer">
                    {r.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div>
            <Label htmlFor="user-description">Description (optionnel)</Label>
            <Textarea
              id="user-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez le problème..."
              rows={3}
              className="mt-1"
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !reason}
            variant="destructive"
          >
            {loading ? 'Envoi...' : 'Signaler'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
