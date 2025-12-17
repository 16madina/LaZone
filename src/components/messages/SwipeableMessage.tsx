import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, CheckCheck, FileText, Reply } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  is_read: boolean | null;
  created_at: string;
  attachment_url?: string | null;
  attachment_type?: string | null;
  attachment_name?: string | null;
  reactions?: MessageReaction[];
  reply_to_id?: string | null;
  reply_to?: Message | null;
}

interface SwipeableMessageProps {
  message: Message;
  isMe: boolean;
  userId: string;
  participantAvatar?: string | null;
  showAvatar?: boolean;
  onDelete: (messageId: string) => void;
  onReaction: (messageId: string, emoji: string) => void;
  onReply: (message: Message) => void;
}

const EMOJI_OPTIONS = ['❤️', '👍', '😂', '😮', '😢', '🙏'];

const SwipeableMessage = ({ message, isMe, userId, participantAvatar, showAvatar = false, onReaction, onReply }: SwipeableMessageProps) => {
  const [showReactions, setShowReactions] = useState(false);
  const longPressRef = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = () => {
    longPressRef.current = setTimeout(() => {
      setShowReactions(true);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  };

  const handleReactionSelect = (emoji: string) => {
    onReaction(message.id, emoji);
    setShowReactions(false);
  };

  // Group reactions by emoji
  const groupedReactions = message.reactions?.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const hasMyReaction = (emoji: string) => 
    message.reactions?.some(r => r.emoji === emoji && r.user_id === userId);

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} group items-end gap-2`}>
      {/* Avatar for received messages */}
      {!isMe && (
        <div className="flex-shrink-0 w-8">
          {showAvatar ? (
            <img
              src={participantAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop'}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop';
              }}
            />
          ) : (
            <div className="w-8" />
          )}
        </div>
      )}
      
      {/* Reply button - left side for received messages */}
      {!isMe && (
        <button
          onClick={() => onReply(message)}
          className="opacity-0 group-hover:opacity-100 self-center p-1.5 hover:bg-muted rounded-full transition-opacity"
        >
          <Reply className="w-4 h-4 text-muted-foreground" />
        </button>
      )}
      
      <motion.div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        whileTap={{ scale: 0.98 }}
        className="relative max-w-[80%]"
      >
        {/* Reply preview */}
        {message.reply_to && (
          <div className={`mb-1 px-3 py-1.5 rounded-lg text-xs ${isMe ? 'bg-primary/20' : 'bg-muted/70'} border-l-2 border-primary/50`}>
            <p className="text-muted-foreground truncate">
              {message.reply_to.content || (message.reply_to.attachment_url ? '📎 Pièce jointe' : '')}
            </p>
          </div>
        )}
        
        <div
          className={`p-3 rounded-2xl ${
            isMe
              ? 'bg-primary text-primary-foreground rounded-br-sm'
              : 'bg-muted rounded-bl-sm'
          }`}
        >
          {/* Attachment */}
          {message.attachment_url && (
            <div className="mb-2">
              {message.attachment_type === 'image' ? (
                <img 
                  src={message.attachment_url} 
                  alt="Image" 
                  className="max-w-full rounded-lg cursor-pointer"
                  onClick={() => window.open(message.attachment_url!, '_blank')}
                />
              ) : (
                <a 
                  href={message.attachment_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 p-2 rounded-lg ${isMe ? 'bg-primary-foreground/10' : 'bg-background/50'}`}
                >
                  <FileText className="w-5 h-5" />
                  <span className="text-sm truncate">{message.attachment_name || 'Fichier'}</span>
                </a>
              )}
            </div>
          )}
          
          {message.content && (
            <p className="text-sm">{message.content}</p>
          )}
          
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

        {/* Reactions display */}
        {Object.keys(groupedReactions).length > 0 && (
          <div className={`flex gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
            {Object.entries(groupedReactions).map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => handleReactionSelect(emoji)}
                className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs ${
                  hasMyReaction(emoji) 
                    ? 'bg-primary/20 border border-primary/30' 
                    : 'bg-muted/50 border border-border'
                }`}
              >
                <span>{emoji}</span>
                {count > 1 && <span className="text-muted-foreground">{count}</span>}
              </button>
            ))}
          </div>
        )}

        {/* Reaction picker */}
        <AnimatePresence>
          {showReactions && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                onClick={() => setShowReactions(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                className={`absolute z-50 ${isMe ? 'right-0' : 'left-0'} bottom-full mb-2 bg-card border border-border rounded-full px-2 py-1 flex gap-1 shadow-lg`}
              >
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReactionSelect(emoji)}
                    className={`p-1.5 hover:bg-muted rounded-full transition-transform hover:scale-125 ${
                      hasMyReaction(emoji) ? 'bg-primary/20' : ''
                    }`}
                  >
                    <span className="text-lg">{emoji}</span>
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Reply button - right side for sent messages */}
      {isMe && (
        <button
          onClick={() => onReply(message)}
          className="opacity-0 group-hover:opacity-100 self-center ml-2 p-1.5 hover:bg-muted rounded-full transition-opacity"
        >
          <Reply className="w-4 h-4 text-muted-foreground" />
        </button>
      )}
    </div>
  );
};

export default SwipeableMessage;
