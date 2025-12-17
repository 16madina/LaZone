import { useState, useRef } from 'react';
import { motion, PanInfo, useMotionValue } from 'framer-motion';
import { MoreVertical, Trash2, Archive } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  propertyId: string;
  propertyTitle: string;
  propertyImage?: string;
}

interface SwipeableConversationProps {
  conversation: Conversation;
  isOnline: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onArchive: () => void;
  index: number;
}

const SwipeableConversation = ({ 
  conversation, 
  isOnline, 
  onSelect, 
  onDelete, 
  onArchive,
  index 
}: SwipeableConversationProps) => {
  const [showActions, setShowActions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -80) {
      setShowActions(true);
    } else {
      setShowActions(false);
    }
  };

  const handleActionClick = (action: 'delete' | 'archive') => {
    if (action === 'delete') {
      onDelete();
    } else {
      onArchive();
    }
    setShowActions(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.05 }}
      ref={containerRef}
      className="relative overflow-hidden rounded-2xl"
    >
      {/* Action buttons behind */}
      {showActions && (
        <div className="absolute right-0 top-0 bottom-0 flex items-center gap-2 pr-2 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleActionClick('archive');
            }}
            className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform"
          >
            <Archive className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleActionClick('delete');
            }}
            className="h-12 w-12 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Conversation card */}
      <motion.button
        drag="x"
        dragConstraints={{ left: -120, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ x }}
        animate={{ x: showActions ? -120 : 0 }}
        onClick={() => !showActions && onSelect()}
        className={`w-full glass-card p-4 flex items-center gap-3 text-left relative bg-card ${showActions ? 'z-0' : 'z-10'}`}
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
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-card rounded-full" />
          )}
          {conversation.unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 gradient-primary rounded-full flex items-center justify-center text-xs text-primary-foreground font-bold">
              {conversation.unreadCount}
            </span>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`font-semibold truncate ${conversation.unreadCount > 0 ? 'text-foreground' : ''}`}>
              {conversation.propertyTitle}
            </h3>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(conversation.lastMessageTime), { addSuffix: false, locale: fr })}
            </span>
          </div>
          <p className="text-xs text-primary truncate mb-0.5">
            👤 {conversation.participantName}
          </p>
          <p className={`text-sm truncate ${conversation.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
            {conversation.lastMessage}
          </p>
        </div>

        <MoreVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </motion.button>
    </motion.div>
  );
};

export default SwipeableConversation;
