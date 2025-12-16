import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, MoreVertical, ArrowLeft, Send, Loader2, 
  MessageCircle, Check, CheckCheck 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMessages, useConversation } from '@/hooks/useMessages';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';

const MessagesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { conversations, loading, totalUnread } = useMessages();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(
    (location.state as any)?.recipientId || null
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Handle recipientId from navigation state
  useEffect(() => {
    const recipientId = (location.state as any)?.recipientId;
    if (recipientId) {
      setSelectedConversation(recipientId);
    }
  }, [location.state]);

  const filteredConversations = conversations.filter(c =>
    c.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    return (
      <ConversationView 
        participantId={selectedConversation}
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
            <motion.button
              key={conversation.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              onClick={() => setSelectedConversation(conversation.participantId)}
              className="w-full glass-card p-4 flex items-center gap-3 text-left"
            >
              <div className="relative">
                <img
                  src={conversation.participantAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'}
                  alt={conversation.participantName}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop';
                  }}
                />
                {conversation.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 gradient-primary rounded-full flex items-center justify-center text-xs text-primary-foreground font-bold">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`font-semibold truncate ${conversation.unreadCount > 0 ? 'text-foreground' : ''}`}>
                    {conversation.participantName}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(conversation.lastMessageTime), { addSuffix: false, locale: fr })}
                  </span>
                </div>
                <p className={`text-sm truncate ${conversation.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  {conversation.lastMessage}
                </p>
                {conversation.propertyTitle && (
                  <p className="text-xs text-primary truncate mt-1">
                    📍 {conversation.propertyTitle}
                  </p>
                )}
              </div>

              <MoreVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
};

interface ConversationViewProps {
  participantId: string;
  onBack: () => void;
}

const ConversationView = ({ participantId, onBack }: ConversationViewProps) => {
  const { user } = useAuth();
  const { messages, loading, sendMessage, isTyping, setTyping } = useConversation(participantId);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [participant, setParticipant] = useState<{ full_name: string; avatar_url: string | null } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    setTyping(false);
    const { error } = await sendMessage(newMessage.trim());
    setSending(false);

    if (!error) {
      setNewMessage('');
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
      <div className="bg-card border-b border-border p-4 flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-muted rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <img
          src={participant?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop'}
          alt={participant?.full_name || 'Utilisateur'}
          className="w-10 h-10 rounded-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop';
          }}
        />
        <div className="flex-1">
          <h2 className="font-semibold">{participant?.full_name || 'Utilisateur'}</h2>
          {isTyping ? (
            <p className="text-xs text-primary animate-pulse">En train d'écrire...</p>
          ) : (
            <p className="text-xs text-muted-foreground">En ligne</p>
          )}
        </div>
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
            {messages.map((message) => {
              const isMe = message.sender_id === user?.id;
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      isMe
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-muted rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : ''}`}>
                      <p className={`text-[10px] ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true, locale: fr })}
                      </p>
                      {isMe && (
                        message.is_read ? (
                          <CheckCheck className="w-3.5 h-3.5 text-primary-foreground/70" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-primary-foreground/70" />
                        )
                      )}
                    </div>
                  </div>
                </motion.div>
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

      {/* Input */}
      <div className="p-4 bg-card border-t border-border">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Votre message..."
            className="flex-1 bg-muted px-4 py-3 rounded-full outline-none focus:ring-2 focus:ring-primary"
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
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