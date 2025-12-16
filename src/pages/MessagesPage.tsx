import { motion } from 'framer-motion';
import { Search, MoreVertical } from 'lucide-react';

const conversations = [
  {
    id: '1',
    name: 'Marie Dubois',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    lastMessage: 'Bonjour! La propriété est-elle toujours disponible?',
    time: '10:30',
    unread: 2,
    property: 'Villa Moderne avec Piscine',
  },
  {
    id: '2',
    name: 'Jean Martin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    lastMessage: 'Parfait, je confirme la visite pour samedi.',
    time: 'Hier',
    unread: 0,
    property: 'Penthouse Vue Panoramique',
  },
  {
    id: '3',
    name: 'Sophie Tremblay',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    lastMessage: 'Merci pour les photos supplémentaires!',
    time: 'Lun',
    unread: 0,
    property: 'Maison Familiale Rénovée',
  },
];

const MessagesPage = () => {
  return (
    <div className="page-container">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="font-display text-2xl font-bold">Messages</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Vos conversations
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
          className="flex-1 bg-transparent outline-none"
        />
      </motion.div>

      {/* Conversations List */}
      <div className="space-y-3">
        {conversations.map((conversation, index) => (
          <motion.div
            key={conversation.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + index * 0.1 }}
            whileTap={{ scale: 0.98 }}
            className="glass-card p-4 flex items-center gap-3 cursor-pointer"
          >
            <div className="relative">
              <img
                src={conversation.avatar}
                alt={conversation.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              {conversation.unread > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 gradient-primary rounded-full flex items-center justify-center text-xs text-primary-foreground font-bold">
                  {conversation.unread}
                </span>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold truncate">{conversation.name}</h3>
                <span className="text-xs text-muted-foreground">{conversation.time}</span>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {conversation.lastMessage}
              </p>
              <p className="text-xs text-primary truncate mt-1">
                📍 {conversation.property}
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              className="p-2 text-muted-foreground"
            >
              <MoreVertical className="w-4 h-4" />
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {conversations.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 text-center mt-8"
        >
          <p className="text-6xl mb-4">💬</p>
          <h3 className="font-display font-semibold text-lg mb-2">
            Pas de messages
          </h3>
          <p className="text-muted-foreground text-sm">
            Vos conversations apparaîtront ici
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default MessagesPage;
