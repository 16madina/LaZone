import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, ArrowLeft, Send, Loader2, 
  MessageCircle, Paperclip, X, FileText, Reply, MapPin
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
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Connectez-vous</h2>
          <p className="text-muted-foreground mb-4">Pour accéder à vos messages</p>
          <Button onClick={() => navigate('/auth')}>Se connecter</Button>
        </div>
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isUserOnline, getLastSeen, fetchLastSeen } = useOnlineStatus();
  const { messages, loading, sendMessage, deleteMessage, addReaction, uploadAttachment, isTyping, setTyping } = useConversation(participantId, propertyId);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [participant, setParticipant] = useState<{ full_name: string; avatar_url: string | null } | null>(null);
  const [propertyInfo, setPropertyInfo] = useState<{ id: string; title: string } | null>(null);
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
          .select('id, title')
          .eq('id', propertyId)
          .maybeSingle();
        
        if (data) {
          setPropertyInfo({ id: data.id, title: data.title });
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
                  showAvatar={!isMe && isLastInGroup}
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
