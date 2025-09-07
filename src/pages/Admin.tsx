import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield, Construction } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      // For now, show admin is under development
      setLoading(false);
    } catch (error) {
      console.error('Error checking access:', error);
      navigate('/profile');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/profile')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au profil
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold">Administration</h1>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Construction className="w-16 h-16 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">Fonctionnalité en développement</CardTitle>
            <CardDescription>
              La page d'administration est actuellement en cours de développement.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              Cette fonctionnalité sera bientôt disponible et permettra de :
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="space-y-2">
                <h4 className="font-medium">Gestion des utilisateurs</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Voir tous les utilisateurs</li>
                  <li>• Gérer les rôles et permissions</li>
                  <li>• Modérer les comptes</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Gestion du contenu</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Modérer les annonces</li>
                  <li>• Gérer les signalements</li>
                  <li>• Configurer l'application</li>
                </ul>
              </div>
            </div>
            <div className="mt-8">
              <Button onClick={() => navigate('/profile')}>
                Retour au profil
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;