import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Shield, Construction, AlertTriangle, Mail, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [loading, setLoading] = useState(true);
  
  // Email test states
  const [emailForm, setEmailForm] = useState({
    to: '',
    subject: 'Test Email LaZone',
    message: 'Ceci est un email de test envoyé depuis LaZone.\n\nSi vous recevez cet email, cela signifie que la configuration email fonctionne correctement.'
  });
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    checkAccess();
  }, [isAdmin, roleLoading]);

  const checkAccess = async () => {
    if (roleLoading) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      if (!isAdmin) {
        toast({
          title: 'Accès refusé',
          description: 'Vous n\'avez pas les permissions d\'administrateur.',
          variant: 'destructive',
        });
        navigate('/profile');
        return;
      }

      setLoading(false);
    } catch (error) {
      console.error('Error checking access:', error);
      navigate('/profile');
    }
  };

  const handleSendTestEmail = async () => {
    if (!emailForm.to || !emailForm.subject || !emailForm.message) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs.',
        variant: 'destructive',
      });
      return;
    }

    setSendingEmail(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-test-email', {
        body: emailForm
      });

      if (error) throw error;

      toast({
        title: 'Email envoyé !',
        description: `Email de test envoyé avec succès à ${emailForm.to}`,
      });

      // Reset form
      setEmailForm(prev => ({
        ...prev,
        to: '',
        message: 'Ceci est un email de test envoyé depuis LaZone.\n\nSi vous recevez cet email, cela signifie que la configuration email fonctionne correctement.'
      }));

    } catch (error: any) {
      console.error('Error sending test email:', error);
      toast({
        title: 'Erreur d\'envoi',
        description: error.message || 'Impossible d\'envoyer l\'email de test.',
        variant: 'destructive',
      });
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <AlertTriangle className="w-16 h-16 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Accès refusé</CardTitle>
            <CardDescription>
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/profile')}>
              Retour au profil
            </Button>
          </CardContent>
        </Card>
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

      <Tabs defaultValue="email" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="email">Test Email</TabsTrigger>
          <TabsTrigger value="admin">Administration</TabsTrigger>
        </TabsList>
        
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                <CardTitle>Test d'envoi d'email</CardTitle>
              </div>
              <CardDescription>
                Testez la configuration email avec votre domaine yl-consulting.fr
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-to">Destinataire</Label>
                <Input
                  id="email-to"
                  type="email"
                  placeholder="exemple@email.com"
                  value={emailForm.to}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, to: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-subject">Sujet</Label>
                <Input
                  id="email-subject"
                  placeholder="Sujet de l'email"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-message">Message</Label>
                <Textarea
                  id="email-message"
                  placeholder="Contenu de l'email de test..."
                  rows={5}
                  value={emailForm.message}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, message: e.target.value }))}
                />
              </div>
              <Button 
                onClick={handleSendTestEmail}
                disabled={sendingEmail}
                className="w-full"
              >
                {sendingEmail ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer l'email de test
                  </>
                )}
              </Button>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Configuration actuelle :</strong><br />
                  Domaine : yl-consulting.fr<br />
                  Statut : ✅ Vérifié et configuré<br />
                  Service : Resend
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="admin">
          <Card>
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Construction className="w-16 h-16 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl">Fonctionnalité en développement</CardTitle>
              <CardDescription>
                Les autres fonctions d'administration seront bientôt disponibles.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-6">
                Fonctionnalités à venir :
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;