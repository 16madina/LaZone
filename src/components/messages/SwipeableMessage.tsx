import { useState, useRef } from 'react';
import { motion, PanInfo, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Trash2, Archive, Heart, ThumbsUp, Smile, Check, CheckCheck, FileText } from 'lucide-react';
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
}

interface SwipeableMessageProps {
  message: Message;
  isMe: boolean;
  userId: string;
  onDelete: (messageId: string) => void;
  onArchive?: (messageId: string) => void;
  onReaction: (messageId: string, emoji: string) => void;
}

const EMOJI_OPTIONS = ['❤️', '👍', '😂', '😮', '😢', '🙏'];

const SwipeableMessage = ({ message, isMe, userId, onDelete, onArchive, onReaction }: SwipeableMessageProps) => {
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const x = useMotionValue(0);
  const constraintsRef = useRef(null);
  const longPressRef = useRef<NodeJS.Timeout | null>(null);

  // Transform for action buttons visibility
  const actionsOpacity = useTransform(x, [-100, -50], [1, 0]);
  const actionsScale = useTransform(x, [-100, -50], [1, 0.8]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -80 && isMe) {
      setShowActions(true);
    } else {
      setShowActions(false);
    }
  };

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
    <div className="relative" ref={constraintsRef}>
      {/* Action buttons behind the message (only for sender) */}
      {isMe && (
        <motion.div 
          className="absolute right-0 top-0 bottom-0 flex items-center gap-2 pr-2"
          style={{ opacity: actionsOpacity, scale: actionsScale }}
        >
          <button
            onClick={() => onDelete(message.id)}
            className="p-2 bg-destructive rounded-full text-destructive-foreground"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {onArchive && (
            <button
              onClick={() => onArchive(message.id)}
              className="p-2 bg-muted rounded-full text-muted-foreground"
            >
              <Archive className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      )}

      <motion.div
        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
        drag={isMe ? "x" : false}
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ x }}
        onTap={() => setShowActions(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        whileTap={{ scale: 0.98 }}
      >
        <div className="relative">
          <div
            className={`max-w-[80%] p-3 rounded-2xl ${
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
        </div>
      </motion.div>

      {/* Inline action buttons when swiped */}
      <AnimatePresence>
        {showActions && isMe && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute right-0 top-1/2 -translate-y-1/2 flex gap-2 pr-2"
          >
            <button
              onClick={() => {
                onDelete(message.id);
                setShowActions(false);
              }}
              className="p-2 bg-destructive rounded-full text-destructive-foreground shadow-lg"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            {onArchive && (
              <button
                onClick={() => {
                  onArchive(message.id);
                  setShowActions(false);
                }}
                className="p-2 bg-muted rounded-full text-muted-foreground shadow-lg"
              >
                <Archive className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SwipeableMessage;