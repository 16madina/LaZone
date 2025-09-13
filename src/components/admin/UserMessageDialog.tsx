import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, MessageCircle, Phone, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
}

interface UserMessageDialogProps {
  user: UserProfile;
  children: React.ReactNode;
}

export const UserMessageDialog: React.FC<UserMessageDialogProps> = ({ user, children }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);

  const getUserDisplayName = () => {
    return user.first_name && user.last_name 
      ? `${user.first_name} ${user.last_name}`
      : 'Utilisateur';
  };

  const sendSMS = async () => {
    if (!user.phone) {
      toast({
        title: 'Erreur',
        description: 'Aucun numéro de téléphone disponible pour cet utilisateur.',
        variant: 'destructive',
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez saisir un message.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-sms', {
        body: {
          to: user.phone,
          message: message,
          type: 'admin'
        }
      });

      if (error) throw error;

      toast({
        title: 'SMS envoyé',
        description: `SMS envoyé avec succès à ${getUserDisplayName()}`,
      });
      
      setMessage('');
      setOpen(false);
    } catch (error) {
      console.error('Error sending SMS:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer le SMS.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = async () => {
    if (!user.email) {
      toast({
        title: 'Erreur',
        description: 'Aucune adresse email disponible pour cet utilisateur.',
        variant: 'destructive',
      });
      return;
    }

    if (!message.trim() || !subject.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez saisir un objet et un message.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-admin-email', {
        body: {
          to: user.email,
          subject: subject,
          message: message,
          recipient_name: getUserDisplayName()
        }
      });

      if (error) throw error;

      toast({
        title: 'Email envoyé',
        description: `Email envoyé avec succès à ${getUserDisplayName()}`,
      });
      
      setMessage('');
      setSubject('');
      setOpen(false);
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer l\'email.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const sendInAppMessage = async () => {
    if (!message.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez saisir un message.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // For now, we'll use a simplified approach - just store as a notification
      // This could be enhanced later to create actual conversations
      toast({
        title: 'Fonctionnalité en développement',
        description: 'Les messages in-app seront disponibles prochainement. Utilisez SMS ou Email pour le moment.',
        variant: 'default',
      });
      
      setMessage('');
      setOpen(false);
    } catch (error) {
      console.error('Error sending in-app message:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer le message dans l\'application.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Envoyer un message à {getUserDisplayName()}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="sms" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sms" className="flex items-center gap-1">
              <Phone className="w-4 h-4" />
              SMS
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="app" className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              App
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="sms" className="space-y-4">
            <div>
              <Label>Numéro de téléphone</Label>
              <p className="text-sm text-muted-foreground">
                {user.phone || 'Non disponible'}
              </p>
            </div>
            <div>
              <Label htmlFor="sms-message">Message SMS</Label>
              <Textarea
                id="sms-message"
                placeholder="Tapez votre message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={160}
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {message.length}/160 caractères
              </p>
            </div>
            <Button 
              onClick={sendSMS} 
              disabled={loading || !user.phone}
              className="w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              {loading ? 'Envoi...' : 'Envoyer SMS'}
            </Button>
          </TabsContent>
          
          <TabsContent value="email" className="space-y-4">
            <div>
              <Label>Adresse email</Label>
              <p className="text-sm text-muted-foreground">
                {user.email || 'Non disponible'}
              </p>
            </div>
            <div>
              <Label htmlFor="email-subject">Objet</Label>
              <input
                id="email-subject"
                type="text"
                placeholder="Objet de l'email"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
              />
            </div>
            <div>
              <Label htmlFor="email-message">Message</Label>
              <Textarea
                id="email-message"
                placeholder="Tapez votre message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
            </div>
            <Button 
              onClick={sendEmail} 
              disabled={loading || !user.email}
              className="w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              {loading ? 'Envoi...' : 'Envoyer Email'}
            </Button>
          </TabsContent>
          
          <TabsContent value="app" className="space-y-4">
            <div>
              <Label>Destinataire</Label>
              <p className="text-sm text-muted-foreground">
                {getUserDisplayName()}
              </p>
            </div>
            <div>
              <Label htmlFor="app-message">Message dans l'application</Label>
              <Textarea
                id="app-message"
                placeholder="Tapez votre message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
            </div>
            <Button 
              onClick={sendInAppMessage} 
              disabled={loading}
              className="w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              {loading ? 'Envoi...' : 'Envoyer Message'}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};