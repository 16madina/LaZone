import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Check, Crown, Zap, CreditCard, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useLocation } from '@/contexts/LocationContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatPriceForCountry } from '@/utils/currency-conversion';

const Subscription: React.FC = () => {
  const { user, profile } = useAuth();
  const { subscription, loading, refreshSubscription } = useSubscription();
  const { selectedCountry } = useLocation();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'per_listing'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);

  const isAgency = profile?.user_type === 'agence';
  const canCreateListing = subscription?.can_create_listing || false;

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour souscrire à un abonnement.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          subscriptionType: selectedPlan,
          country: selectedCountry
        }
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la session de paiement.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) {
        throw error;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ouvrir le portail client.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Formules d'abonnement</h1>
          <p className="text-muted-foreground">
            Choisissez la formule qui convient le mieux à vos besoins
          </p>
        </div>

        {/* Current Status */}
        {subscription && (
          <Card className="mb-8 border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" />
                Statut actuel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4">
                <Badge variant={subscription.subscribed ? "default" : "secondary"}>
                  {subscription.subscribed ? "Abonné" : "Non abonné"}
                </Badge>
                {subscription.subscription_type === 'monthly' && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Annonces illimitées jusqu'au {new Date(subscription.subscription_end!).toLocaleDateString('fr-FR')}
                  </Badge>
                )}
                {subscription.listings_remaining > 0 && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {subscription.listings_remaining} crédit{subscription.listings_remaining > 1 ? 's' : ''} restant{subscription.listings_remaining > 1 ? 's' : ''}
                  </Badge>
                )}
                <Badge variant={canCreateListing ? "default" : "destructive"}>
                  {canCreateListing ? "Peut créer des annonces" : "Ne peut pas créer d'annonces"}
                </Badge>
              </div>
              {subscription.subscribed && (
                <div className="mt-4">
                  <Button onClick={handleManageSubscription} disabled={isProcessing}>
                    Gérer mon abonnement
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Subscription Plans */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Monthly Plan */}
          <Card className={`relative ${selectedPlan === 'monthly' ? 'border-primary ring-2 ring-primary/20' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Abonnement Mensuel
                </CardTitle>
                <Badge variant="secondary">Populaire</Badge>
              </div>
              <CardDescription>
                Annonces illimitées pendant 30 jours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">
                {formatPriceForCountry(20000, selectedCountry)}
                <span className="text-sm font-normal text-muted-foreground">/mois</span>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Annonces illimitées</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Support prioritaire</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Statistiques avancées</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Renouvellement automatique</span>
                </li>
              </ul>
              <RadioGroup value={selectedPlan} onValueChange={(value) => setSelectedPlan(value as 'monthly' | 'per_listing')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly">Choisir ce plan</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Per Listing Plan */}
          <Card className={`relative ${selectedPlan === 'per_listing' ? 'border-primary ring-2 ring-primary/20' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Paiement par Annonce
              </CardTitle>
              <CardDescription>
                Payez uniquement pour les annonces que vous publiez
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">
                {formatPriceForCountry(1000, selectedCountry)}
                <span className="text-sm font-normal text-muted-foreground">/annonce</span>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">1 crédit par achat</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Pas d'engagement</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Crédits sans expiration</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Parfait pour usage occasionnel</span>
                </li>
              </ul>
              <RadioGroup value={selectedPlan} onValueChange={(value) => setSelectedPlan(value as 'monthly' | 'per_listing')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="per_listing" id="per_listing" />
                  <Label htmlFor="per_listing">Choisir ce plan</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Button */}
        <div className="text-center">
          <Button 
            onClick={handleSubscribe} 
            disabled={isProcessing || !user}
            size="lg"
            className="px-8"
          >
            <Zap className="w-4 h-4 mr-2" />
            {isProcessing ? 'Traitement...' : `S'abonner - ${formatPriceForCountry(selectedPlan === 'monthly' ? 20000 : 1000, selectedCountry)}`}
          </Button>
          {!user && (
            <p className="text-sm text-muted-foreground mt-2">
              Connectez-vous pour souscrire à un abonnement
            </p>
          )}
        </div>

        {/* Limits Information */}
        <Card className="mt-8 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800">Limites des annonces gratuites</CardTitle>
          </CardHeader>
          <CardContent className="text-orange-700">
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Particuliers et démarcheurs :</strong> 3 annonces gratuites maximum</li>
              <li><strong>Agences :</strong> Aucune annonce gratuite (abonnement obligatoire)</li>
              <li>Après épuisement des annonces gratuites, un abonnement est requis</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Subscription;