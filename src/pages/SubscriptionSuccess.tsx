import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Home, Plus } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';

const SubscriptionSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { refreshSubscription } = useSubscription();

  useEffect(() => {
    // Refresh subscription status after successful subscription
    refreshSubscription();
  }, [refreshSubscription]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Abonnement activé !</CardTitle>
          <CardDescription>
            Votre abonnement mensuel est maintenant actif
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Vous pouvez maintenant créer un nombre illimité d'annonces pendant 30 jours.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => navigate('/new')} 
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer une annonce
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/subscription')} 
              className="w-full"
            >
              <Crown className="w-4 h-4 mr-2" />
              Gérer mon abonnement
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/')} 
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionSuccess;