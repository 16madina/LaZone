import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SponsorshipLevels } from './SponsorshipLevels';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SponsorListingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  listingTitle: string;
}

export const SponsorListingDialog: React.FC<SponsorListingDialogProps> = ({
  isOpen,
  onClose,
  listingId,
  listingTitle
}) => {
  const [selectedLevel, setSelectedLevel] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSponsor = async () => {
    if (!selectedLevel || !selectedDuration) {
      toast({
        title: "Sélection incomplète",
        description: "Veuillez choisir un niveau et une durée de sponsorisation.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Call edge function to create sponsored listing
      const { data, error } = await supabase.functions.invoke('create-sponsored-listing', {
        body: {
          listing_id: listingId,
          boost_level: selectedLevel,
          duration: selectedDuration
        }
      });

      if (error) throw error;

      // Open Stripe checkout
      if (data?.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Redirection vers le paiement",
          description: "Vous allez être redirigé vers Stripe pour finaliser le paiement.",
        });
        onClose();
      }

    } catch (error) {
      console.error('Error creating sponsored listing:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la création de la sponsorisation.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedLevel(0);
    setSelectedDuration(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Sponsoriser votre annonce
          </DialogTitle>
          <p className="text-muted-foreground">
            <strong>{listingTitle}</strong>
          </p>
          <p className="text-sm text-muted-foreground">
            Augmentez la visibilité de votre annonce en la sponsorisant. 
            Les annonces sponsorisées apparaissent en premier dans les résultats de recherche.
          </p>
        </DialogHeader>

        <div className="mt-6">
          <SponsorshipLevels
            selectedLevel={selectedLevel}
            selectedDuration={selectedDuration}
            onLevelSelect={setSelectedLevel}
            onDurationSelect={setSelectedDuration}
            onSponsor={handleSponsor}
            loading={loading}
          />
        </div>

        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};