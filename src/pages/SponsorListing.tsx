import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { SponsorshipLevels } from '@/components/sponsorship/SponsorshipLevels';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function SponsorListing() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [listing, setListing] = useState<any>(null);
  const [selectedLevel, setSelectedLevel] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const listingId = searchParams.get('listing');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      handlePaymentSuccess();
    }
  }, [sessionId]);

  useEffect(() => {
    if (listingId) {
      fetchListing();
    }
  }, [listingId]);

  const fetchListing = async () => {
    if (!listingId) return;
    
    const { data, error } = await supabase
      .from('listings')
      .select('id, title, price, currency')
      .eq('id', listingId)
      .eq('user_id', user?.id)
      .single();
      
    if (error || !data) {
      toast({
        title: "Erreur",
        description: "Annonce non trouvée ou vous n'en êtes pas le propriétaire.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }
    
    setListing(data);
  };

  const handlePaymentSuccess = async () => {
    if (!sessionId) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('handle-sponsored-payment-success', {
        body: { session_id: sessionId }
      });
      
      if (error) throw error;
      
      toast({
        title: "Sponsorisation activée !",
        description: "Votre annonce est maintenant sponsorisée et apparaîtra en tête des résultats.",
      });
      
      navigate('/');
    } catch (error) {
      console.error('Payment success error:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'activation de la sponsorisation.",
        variant: "destructive",
      });
    }
  };

  const handleSponsor = async () => {
    if (!selectedLevel || !selectedDuration || !listingId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-sponsored-listing', {
        body: {
          listing_id: listingId,
          boost_level: selectedLevel,
          duration: selectedDuration
        }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la création de la sponsorisation.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!listing && !sessionId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-muted-foreground">Annonce non trouvée</p>
              <Button className="mt-4" onClick={() => navigate('/')}>
                Retour à l'accueil
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/')}
          className="flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
      </div>

      {sessionId ? (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Finalisation de votre sponsorisation...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Sponsoriser votre annonce</CardTitle>
            <p className="text-muted-foreground">
              <strong>{listing?.title}</strong>
            </p>
          </CardHeader>
          <CardContent>
            <SponsorshipLevels
              selectedLevel={selectedLevel}
              selectedDuration={selectedDuration}
              onLevelSelect={setSelectedLevel}
              onDurationSelect={setSelectedDuration}
              onSponsor={handleSponsor}
              loading={loading}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}