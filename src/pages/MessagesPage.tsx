import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, ArrowLeft, Send, Loader2, 
  MessageCircle, Paperclip, X, FileText, Reply, MapPin,
  MoreVertical, Calendar, Flag
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import { useMessages, useConversation } from '@/hooks/useMessages';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import SwipeableMessage from '@/components/messages/SwipeableMessage';
import SwipeableConversation from '@/components/messages/SwipeableConversation';
import { AppointmentDialog } from '@/components/appointment/AppointmentDialog';
import { ReportUserDialog } from '@/components/messages/ReportUserDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const MessagesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { conversations, loading, totalUnread, deleteConversation, archiveConversation } = useMessages();
  const { isUserOnline, fetchLastSeen } = useOnlineStatus();
  const [selectedConversation, setSelectedConversation] = useState<{ participantId: string; propertyId: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle recipientId and propertyId from navigation state (when coming from property detail)
  useEffect(() => {
    const state = location.state as any;
    const recipientId = state?.recipientId;
    const propertyId = state?.propertyId;
    if (recipientId && recipientId !== user?.id && propertyId) {
      setSelectedConversation({ participantId: recipientId, propertyId });
    }
  }, [location.state, user?.id]);

  const filteredConversations = conversations.filter(c =>
    c.propertyTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteConversation = async (conversationId: string) => {
    if (deleteConversation) {
      const { error } = await deleteConversation(conversationId);
      if (error) {
        toast({
          title: 'Erreur',
          description: 'Impossible de supprimer la conversation',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Conversation supprimée',
          description: 'La conversation a été supprimée'
        });
      }
    }
  };

  const handleArchiveConversation = async (conversationId: string) => {
    if (archiveConversation) {
      const { error } = await archiveConversation(conversationId);
      if (error) {
        toast({
          title: 'Erreur',
          description: 'Impossible d\'archiver la conversation',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Archivé',
          description: 'Conversation archivée'
        });
      }
    }
  };

  if (!user) {
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[70vh] px-6">
        {/* Animated illustration */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative mb-8"
        >
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <motion.div
              animate={{ 
                y: [0, -8, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <MessageCircle className="w-16 h-16 text-primary" strokeWidth={1.5} />
            </motion.div>
          </div>
          {/* Decorative bubbles */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary/30"
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
            className="absolute bottom-0 -left-3 w-4 h-4 rounded-full bg-primary/20"
          />
        </motion.div>

        {/* Title and subtitle */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h2 className="font-display text-2xl font-bold mb-2">Vos messages vous attendent</h2>
          <p className="text-muted-foreground">Connectez-vous pour discuter avec les propriétaires</p>
        </motion.div>

        {/* Features list */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-5 w-full max-w-sm mb-8"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Send className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Chat en temps réel</p>
                <p className="text-xs text-muted-foreground">Messages instantanés</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Paperclip className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Pièces jointes</p>
                <p className="text-xs text-muted-foreground">Photos et documents</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Rendez-vous</p>
                <p className="text-xs text-muted-foreground">Planifiez vos visites</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-sm"
        >
          <Button 
            onClick={() => navigate('/auth')} 
            className="w-full h-12 text-base font-semibold"
            size="lg"
          >
            Se connecter
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-3">
            Pas encore de compte ? <button onClick={() => navigate('/auth')} className="text-primary font-medium">Créer un compte</button>
          </p>
        </motion.div>
      </div>
    );
  }

  if (selectedConversation) {
    // Fetch last seen when selecting a conversation
    if (!isUserOnline(selectedConversation.participantId)) {
      fetchLastSeen([selectedConversation.participantId]);
    }
    
    return (
      <ConversationView 
        participantId={selectedConversation.participantId}
        propertyId={selectedConversation.propertyId}
        onBack={() => setSelectedConversation(null)}
      />
    );
  }

  return (
    <div className="page-container">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="font-display text-2xl font-bold">Messages</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {totalUnread > 0 ? `${totalUnread} non lu${totalUnread > 1 ? 's' : ''}` : 'Vos conversations'}
        </p>
      </motion.header>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="search-bar mb-4"
      >
        <Search className="w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher une conversation..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent outline-none"
        />
      </motion.div>

      {/* Conversations List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredConversations.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 text-center mt-8"
        >
          <MessageCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-display font-semibold text-lg mb-2">
            Pas de messages
          </h3>
          <p className="text-muted-foreground text-sm">
            Vos conversations apparaîtront ici
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filteredConversations.map((conversation, index) => (
            <SwipeableConversation
              key={conversation.id}
              conversation={conversation}
              isOnline={isUserOnline(conversation.participantId)}
              onSelect={() => setSelectedConversation({ 
                participantId: conversation.participantId, 
                propertyId: conversation.propertyId 
              })}
              onDelete={() => handleDeleteConversation(conversation.id)}
              onArchive={() => handleArchiveConversation(conversation.id)}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
};
interface ConversationViewProps {
  participantId: string;
  propertyId: string;
  onBack: () => void;
}

const ConversationView = ({ participantId, propertyId, onBack }: ConversationViewProps) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { isUserOnline, getLastSeen, fetchLastSeen } = useOnlineStatus();
  const { messages, loading, sendMessage, deleteMessage, addReaction, uploadAttachment, isTyping, setTyping } = useConversation(participantId, propertyId);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [participant, setParticipant] = useState<{ full_name: string; avatar_url: string | null } | null>(null);
  const [propertyInfo, setPropertyInfo] = useState<{ id: string; title: string; ownerId: string } | null>(null);
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<{ url: string; type: 'image' | 'file'; name: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: string; content: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isOnline = isUserOnline(participantId);
  const lastSeen = getLastSeen(participantId);

  useEffect(() => {
    if (!isOnline) {
      fetchLastSeen([participantId]);
    }
  }, [isOnline, participantId, fetchLastSeen]);

  useEffect(() => {
    // Fetch participant info
    const fetchParticipant = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('user_id', participantId)
        .maybeSingle();
      setParticipant(data);
    };
    fetchParticipant();
  }, [participantId]);

  // Fetch property info
  useEffect(() => {
    const fetchPropertyInfo = async () => {
      if (propertyId) {
        const { data } = await supabase
          .from('properties')
          .select('id, title, user_id')
          .eq('id', propertyId)
          .maybeSingle();
        
        if (data) {
          setPropertyInfo({ id: data.id, title: data.title, ownerId: data.user_id });
        }
      }
    };
    fetchPropertyInfo();
  }, [propertyId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    setTyping(true);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
    }, 2000);
  }, [setTyping]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      setTyping(false);
    };
  }, [setTyping]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Le fichier est trop volumineux (max 10MB)');
      return;
    }

    setUploading(true);
    const result = await uploadAttachment(file);
    setUploading(false);

    if (result) {
      setPendingAttachment(result);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    if ((!newMessage.trim() && !pendingAttachment) || sending) return;

    setSending(true);
    setTyping(false);
    
    const { error } = await sendMessage(
      newMessage.trim(), 
      pendingAttachment || undefined,
      replyTo?.id
    );
    
    setSending(false);

    if (!error) {
      setNewMessage('');
      setPendingAttachment(null);
      setReplyTo(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    handleTyping();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="p-4 flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-muted rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="relative">
            <img
              src={participant?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop'}
              alt={participant?.full_name || 'Utilisateur'}
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop';
              }}
            />
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="font-semibold">{participant?.full_name || 'Utilisateur'}</h2>
            {isTyping ? (
              <p className="text-xs text-primary animate-pulse">En train d'écrire...</p>
            ) : isOnline ? (
              <p className="text-xs text-green-500">En ligne</p>
            ) : lastSeen ? (
              <p className="text-xs text-muted-foreground">
                Vu {formatDistanceToNow(new Date(lastSeen), { addSuffix: true, locale: fr })}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">Hors ligne</p>
            )}
          </div>
          
          {/* 3-dot Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-muted rounded-full">
                <MoreVertical className="w-5 h-5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {propertyInfo && propertyInfo.ownerId !== user?.id && (
                <>
                  <AppointmentDialog
                    propertyId={propertyInfo.id}
                    ownerId={propertyInfo.ownerId}
                    propertyTitle={propertyInfo.title}
                    trigger={
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Calendar className="w-4 h-4 mr-2" />
                        Prendre rendez-vous
                      </DropdownMenuItem>
                    }
                  />
                  <DropdownMenuSeparator />
                </>
              )}
              <ReportUserDialog
                userId={participantId}
                userName={participant?.full_name}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                    <Flag className="w-4 h-4 mr-2" />
                    Signaler l'utilisateur
                  </DropdownMenuItem>
                }
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Property Banner */}
        {propertyInfo && (
          <button
            onClick={() => navigate(`/property/${propertyInfo.id}`)}
            className="w-full px-4 py-2 bg-primary/10 border-t border-primary/20 flex items-center gap-2 hover:bg-primary/20 transition-colors"
          >
            <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-sm text-primary font-medium truncate">{propertyInfo.title}</span>
            <ArrowLeft className="w-4 h-4 text-primary rotate-180 ml-auto flex-shrink-0" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Commencez la conversation</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isMe = message.sender_id === user?.id;
              // Show avatar only for the last message in a consecutive group from same sender
              const nextMessage = messages[index + 1];
              const isLastInGroup = !nextMessage || nextMessage.sender_id !== message.sender_id;
              
              return (
                <SwipeableMessage
                  key={message.id}
                  message={message}
                  isMe={isMe}
                  userId={user?.id || ''}
                  participantAvatar={participant?.avatar_url}
                  myAvatar={profile?.avatar_url}
                  showAvatar={isLastInGroup}
                  onDelete={async (messageId) => {
                    const { error } = await deleteMessage(messageId);
                    if (error) {
                      toast({
                        title: 'Erreur',
                        description: 'Impossible de supprimer le message',
                        variant: 'destructive'
                      });
                    } else {
                      toast({
                        title: 'Message supprimé',
                        description: 'Le message a été supprimé'
                      });
                    }
                  }}
                  onReaction={async (messageId, emoji) => {
                    await addReaction(messageId, emoji);
                  }}
                  onReply={(msg) => setReplyTo({ id: msg.id, content: msg.content || '📎 Pièce jointe' })}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}

        {/* Typing indicator in chat */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-muted p-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Pending attachment preview */}
      {pendingAttachment && (
        <div className="px-4 py-2 bg-muted/50 border-t border-border">
          <div className="flex items-center gap-2">
            {pendingAttachment.type === 'image' ? (
              <img src={pendingAttachment.url} alt="Preview" className="h-16 w-16 object-cover rounded-lg" />
            ) : (
              <div className="h-16 w-16 bg-muted rounded-lg flex items-center justify-center">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{pendingAttachment.name}</p>
              <p className="text-xs text-muted-foreground">
                {pendingAttachment.type === 'image' ? 'Image' : 'Fichier'}
              </p>
            </div>
            <button 
              onClick={() => setPendingAttachment(null)}
              className="p-2 hover:bg-muted rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Reply preview */}
      {replyTo && (
        <div className="px-4 py-2 bg-muted/50 border-t border-border">
          <div className="flex items-center gap-2">
            <Reply className="w-4 h-4 text-primary" />
            <div className="flex-1 min-w-0 border-l-2 border-primary pl-2">
              <p className="text-xs text-muted-foreground">Répondre à</p>
              <p className="text-sm truncate">{replyTo.content}</p>
            </div>
            <button 
              onClick={() => setReplyTo(null)}
              className="p-2 hover:bg-muted rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Quick Replies */}
      {messages.length === 0 && !newMessage && (
        <div className="px-4 py-2 bg-card border-t border-border">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {[
              "Bonjour, je suis intéressé(e)",
              "Le prix est-il négociable ?",
              "Est-il toujours disponible ?"
            ].map((quickMessage) => (
              <button
                key={quickMessage}
                onClick={() => setNewMessage(quickMessage)}
                className="flex-shrink-0 px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
              >
                {quickMessage}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-card border-t border-border">
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="p-3 hover:bg-muted rounded-full transition-colors"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : (
              <Paperclip className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={replyTo ? "Répondre..." : "Votre message..."}
            className="flex-1 bg-muted px-4 py-3 rounded-full outline-none focus:ring-2 focus:ring-primary"
          />
          <Button
            onClick={handleSend}
            disabled={(!newMessage.trim() && !pendingAttachment) || sending}
            size="icon"
            className="rounded-full gradient-primary h-12 w-12"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
