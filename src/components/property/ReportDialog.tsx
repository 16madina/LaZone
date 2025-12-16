import { useState } from 'react';
import { Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface ReportDialogProps {
  propertyId: string;
  trigger?: React.ReactNode;
}

const reportReasons = [
  { value: 'spam', label: 'Spam ou publicité' },
  { value: 'inappropriate_content', label: 'Contenu inapproprié' },
  { value: 'fraud', label: 'Fraude ou arnaque' },
  { value: 'false_info', label: 'Fausse information' },
  { value: 'other', label: 'Autre' },
];

export const ReportDialog = ({ propertyId, trigger }: ReportDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: 'Connexion requise',
        description: 'Vous devez être connecté pour signaler une annonce.',
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
      const { error } = await supabase
        .from('property_reports')
        .insert({
          property_id: propertyId,
          reporter_id: user.id,
          reason: reason as any,
          description: description || null,
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: 'Déjà signalé',
            description: 'Vous avez déjà signalé cette annonce.',
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: 'Signalement envoyé',
          description: 'Merci pour votre signalement. Notre équipe va l\'examiner.',
        });
      }

      setOpen(false);
      setReason('');
      setDescription('');
    } catch (error) {
      console.error('Error reporting property:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer le signalement.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Flag className="w-4 h-4 mr-1" />
            Signaler
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Signaler cette annonce</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label className="mb-3 block">Motif du signalement</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {reportReasons.map((r) => (
                <div key={r.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={r.value} id={r.value} />
                  <Label htmlFor={r.value} className="font-normal cursor-pointer">
                    {r.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div>
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez le problème..."
              rows={3}
              className="mt-1"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !reason}>
            {loading ? 'Envoi...' : 'Envoyer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
