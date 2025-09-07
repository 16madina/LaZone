import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Check, Crown, Zap, CreditCard, Calendar, RefreshCw, Settings, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useLocation } from '@/contexts/LocationContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatPriceForCountry } from '@/utils/currency-conversion';

interface AppSettings {
  monthly_price: number;
  yearly_price: number;
  per_listing_price: number;
  subscription_required: boolean;
  free_listings_individual: number;
  free_listings_canvasser: number;
  free_listings_agency: number;
}

const Subscription: React.FC = () => {
  const { user, profile } = useAuth();
  const { subscription, loading, refreshSubscription } = useSubscription();
  const { selectedCountry } = useLocation();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'per_listing'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [tempSettings, setTempSettings] = useState<AppSettings>({
    monthly_price: 20000,
    yearly_price: 240000,
    per_listing_price: 1000,
    subscription_required: false,
    free_listings_individual: 3,
    free_listings_canvasser: 3,
    free_listings_agency: 0
  });
  const [settings, setSettings] = useState<AppSettings>({
    monthly_price: 20000,
    yearly_price: 240000,
    per_listing_price: 1000,
    subscription_required: false,
    free_listings_individual: 3,
    free_listings_canvasser: 3,
    free_listings_agency: 0
  });
  const [settingsLoading, setSettingsLoading] = useState(true);

  const isAgency = profile?.user_type === 'agence';
  const canCreateListing = subscription?.can_create_listing || false;

  const checkAdminRole = async () => {
    if (!user) {
      setIsAdmin(false);
      setAdminLoading(false);
      return;
    }

    try {
      // Mock admin check since has_role function doesn't exist
      setIsAdmin(false);
    } catch (error) {
      console.error('Error checking admin role:', error);
      setIsAdmin(false);
    } finally {
      setAdminLoading(false);
    }
  };

  const fetchSettings = async () => {
    console.log('🔍 Fetching settings...');
    try {
      // Mock settings since app_settings table doesn't exist
      const mockSettings = {
        monthly_price: '4900',
        yearly_price: '49000',
        free_listings_individual: '3',
        free_listings_canvasser: '5',
        free_listings_agency: '0',
        subscription_required: 'false'
      };

      setSettings({
        monthly_price: parseInt(mockSettings.monthly_price) || 4900,
        yearly_price: parseInt(mockSettings.yearly_price) || 49000,
        per_listing_price: 1000,
        subscription_required: mockSettings.subscription_required === 'true',
        free_listings_individual: parseInt(mockSettings.free_listings_individual) || 3,
        free_listings_canvasser: parseInt(mockSettings.free_listings_canvasser) || 5,
        free_listings_agency: parseInt(mockSettings.free_listings_agency) || 0
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setSettingsLoading(false);
    }
  };
  useEffect(() => {
    fetchSettings();
    checkAdminRole();

    // Écouter les changements en temps réel sur app_settings
    const channel = supabase
      .channel('app-settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Écouter tous les événements (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'app_settings'
        },
        (payload) => {
          console.log('🔄 App settings changed in real-time:', payload);
          console.log('Settings avant fetch:', settings);
          // Refetch les settings quand ils changent
          fetchSettings().then(() => {
            console.log('✅ Settings refetchés après changement temps réel');
          });
        }
      )
      .subscribe((status) => {
        console.log('📡 Canal real-time status:', status);
      });

    return () => {
      console.log('🔌 Fermeture du canal real-time');
      supabase.removeChannel(channel);
    };
  }, []);

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

  const saveAdminSettings = async () => {
    if (!isAdmin) return;

    setIsProcessing(true);
    try {
      // Mock save since app_settings table doesn't exist
      console.log('Mock saving settings:', tempSettings);
      
      setSettings(tempSettings);
      setIsEditMode(false);
      
      toast({
        title: "Paramètres mis à jour",
        description: "Les nouveaux paramètres ont été sauvegardés avec succès.",
        variant: "default"
      });

      // Refetch pour être sûr
      fetchSettings();
    } catch (error) {
      console.error('Error saving admin settings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading || settingsLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Formules d'abonnement</h1>
          <p className="text-muted-foreground">
            Choisissez la formule qui convient le mieux à vos besoins
          </p>
        </div>

        {/* Settings and Pricing Display */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Tarifs et Limites Actuels</h2>
            <div className="flex gap-2">
              {isAdmin && (
                <>
                  {!isEditMode ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditMode(true)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Modifier
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditMode(false);
                          setTempSettings(settings);
                        }}
                      >
                        Annuler
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={saveAdminSettings}
                        disabled={isProcessing}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Sauvegarder
                      </Button>
                    </>
                  )}
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log('🔄 Refresh manuel des settings...');
                  fetchSettings();
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </div>
          
          {settingsLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
              <Card>
                <CardContent className="p-3 text-center">
                  {isEditMode && isAdmin ? (
                    <div className="space-y-2">
                      <Input
                        type="number"
                        value={tempSettings.monthly_price}
                        onChange={(e) => setTempSettings(prev => ({
                          ...prev,
                          monthly_price: parseInt(e.target.value) || 0
                        }))}
                        className="text-center"
                      />
                      <p className="text-xs text-muted-foreground">Abonnement mensuel (CFA)</p>
                    </div>
                  ) : (
                    <>
                      <div className="text-lg font-bold text-primary">
                        {formatPriceForCountry(settings.monthly_price, selectedCountry)}
                      </div>
                      <p className="text-xs text-muted-foreground">Abonnement mensuel</p>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3 text-center">
                  {isEditMode && isAdmin ? (
                    <div className="space-y-2">
                      <Input
                        type="number"
                        value={tempSettings.per_listing_price}
                        onChange={(e) => setTempSettings(prev => ({
                          ...prev,
                          per_listing_price: parseInt(e.target.value) || 0
                        }))}
                        className="text-center"
                      />
                      <p className="text-xs text-muted-foreground">Par annonce (CFA)</p>
                    </div>
                  ) : (
                    <>
                      <div className="text-lg font-bold text-primary">
                        {formatPriceForCountry(settings.per_listing_price, selectedCountry)}
                      </div>
                      <p className="text-xs text-muted-foreground">Par annonce</p>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3 text-center">
                  {isEditMode && isAdmin ? (
                    <div className="space-y-2">
                      <Input
                        type="number"
                        value={tempSettings.free_listings_individual}
                        onChange={(e) => setTempSettings(prev => ({
                          ...prev,
                          free_listings_individual: parseInt(e.target.value) || 0
                        }))}
                        className="text-center"
                      />
                      <p className="text-xs text-muted-foreground">Annonces gratuites (Particuliers)</p>
                    </div>
                  ) : (
                    <>
                      <div className="text-lg font-bold text-green-600">
                        {settings.free_listings_individual}
                      </div>
                      <p className="text-xs text-muted-foreground">Annonces gratuites (Particuliers)</p>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3 text-center">
                  {isEditMode && isAdmin ? (
                    <div className="space-y-2">
                      <Input
                        type="number"
                        value={tempSettings.free_listings_canvasser}
                        onChange={(e) => setTempSettings(prev => ({
                          ...prev,
                          free_listings_canvasser: parseInt(e.target.value) || 0
                        }))}
                        className="text-center"
                      />
                      <p className="text-xs text-muted-foreground">Annonces gratuites (Démarcheurs)</p>
                    </div>
                  ) : (
                    <>
                      <div className="text-lg font-bold text-green-600">
                        {settings.free_listings_canvasser}
                      </div>
                      <p className="text-xs text-muted-foreground">Annonces gratuites (Démarcheurs)</p>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3 text-center">
                  {isEditMode && isAdmin ? (
                    <div className="space-y-2">
                      <Input
                        type="number"
                        value={tempSettings.free_listings_agency}
                        onChange={(e) => setTempSettings(prev => ({
                          ...prev,
                          free_listings_agency: parseInt(e.target.value) || 0
                        }))}
                        className="text-center"
                      />
                      <p className="text-xs text-muted-foreground">Annonces gratuites (Agences)</p>
                    </div>
                  ) : (
                    <>
                      <div className="text-lg font-bold text-red-600">
                        {settings.free_listings_agency}
                      </div>
                      <p className="text-xs text-muted-foreground">Annonces gratuites (Agences)</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
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
                {formatPriceForCountry(settings.monthly_price, selectedCountry)}
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
                {formatPriceForCountry(settings.per_listing_price, selectedCountry)}
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
            {isProcessing ? 'Traitement...' : `S'abonner - ${formatPriceForCountry(selectedPlan === 'monthly' ? settings.monthly_price : settings.per_listing_price, selectedCountry)}`}
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
              <li><strong>Particuliers :</strong> {settings.free_listings_individual} annonce{settings.free_listings_individual > 1 ? 's' : ''} gratuite{settings.free_listings_individual > 1 ? 's' : ''} maximum</li>
              <li><strong>Démarcheurs :</strong> {settings.free_listings_canvasser} annonce{settings.free_listings_canvasser > 1 ? 's' : ''} gratuite{settings.free_listings_canvasser > 1 ? 's' : ''} maximum</li>
              <li><strong>Agences :</strong> {settings.free_listings_agency === 0 ? 'Aucune annonce gratuite (abonnement obligatoire)' : `${settings.free_listings_agency} annonce${settings.free_listings_agency > 1 ? 's' : ''} gratuite${settings.free_listings_agency > 1 ? 's' : ''} maximum`}</li>
              <li>Après épuisement des annonces gratuites, un abonnement est requis</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Subscription;