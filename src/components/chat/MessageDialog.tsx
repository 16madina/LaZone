import React, { useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Property } from '@/components/PropertyCard';

interface MessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
  sellerId: string;
}

export function MessageDialog({ isOpen, onClose, property, sellerId }: MessageDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendMessage = async () => {
    if (!user) {
      toast({
        title: 'Connexion requise',
        description: 'Vous devez être connecté pour envoyer un message.',
        variant: 'destructive',
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: 'Message vide',
        description: 'Veuillez saisir un message.',
        variant: 'destructive',
      });
      return;
    }

    if (user.id === sellerId) {
      toast({
        title: 'Action non autorisée',
        description: 'Vous ne pouvez pas vous envoyer un message à vous-même.',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    try {
      // Check if conversation already exists
      const { data: existingConversation, error: conversationError } = await supabase
        .from('conversations')
        .select('id')
        .eq('buyer_id', user.id)
        .eq('seller_id', sellerId)
        .eq('listing_id', property.id)
        .maybeSingle();

      if (conversationError && conversationError.code !== 'PGRST116') {
        throw conversationError;
      }

      let conversationId = existingConversation?.id;

      // Create conversation if it doesn't exist
      if (!conversationId) {
        const { data: newConversation, error: createError } = await supabase
          .from('conversations')
          .insert({
            buyer_id: user.id,
            seller_id: sellerId,
            listing_id: property.id,
            status: 'active',
            last_message_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (createError) throw createError;
        conversationId = newConversation.id;
      }

      // Send the message
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          message: message.trim(),
          message_type: 'text'
        });

      if (messageError) throw messageError;

      // Update conversation's last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

      toast({
        title: 'Message envoyé',
        description: 'Votre message a été envoyé avec succès.',
      });

      setMessage('');
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer le message. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Envoyer un message
          </DialogTitle>
          <DialogDescription>
            Contactez le vendeur de cette propriété
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Property Info */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm font-medium text-foreground">
              {property.title}
            </div>
            <div className="text-xs text-muted-foreground">
              {property.location.neighborhood}, {property.location.city}
            </div>
          </div>

          {/* Agent Info */}
          <div className="flex items-center gap-3 p-3 bg-background border rounded-lg">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
              {property.agent.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{property.agent.name}</span>
                {property.agent.isVerified && (
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Agent immobilier
              </div>
            </div>
          </div>

          {/* Message Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Votre message</label>
            <Textarea
              placeholder={`Bonjour ${property.agent.name}, je suis intéressé(e) par votre propriété "${property.title}". Pourrions-nous discuter ?`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={4}
              disabled={sending}
              className="resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={sending}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={sending || !message.trim()}
              className="flex-1"
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Envoyer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}