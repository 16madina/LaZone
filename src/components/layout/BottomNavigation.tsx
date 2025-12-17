import { Home, Map, PlusCircle, MessageCircle, User } from 'lucide-react';
import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { to: '/', icon: Home, label: 'Accueil' },
  { to: '/map', icon: Map, label: 'Carte' },
  { to: '/publish', icon: PlusCircle, label: 'Publier' },
  { to: '/messages', icon: MessageCircle, label: 'Messages' },
  { to: '/profile', icon: User, label: 'Profil' },
];

export const BottomNavigation = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { totalUnread } = useMessages();

  return (
    <motion.nav 
      className="bottom-nav"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center justify-around py-1 px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          const isPublish = item.to === '/publish';
          const isMessages = item.to === '/messages';
          const showBadge = isMessages && user && totalUnread > 0;
          
          return (
            <RouterNavLink
              key={item.to}
              to={item.to}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-300"
            >
              <motion.div 
                className="flex flex-col items-center gap-1 relative"
                whileTap={{ scale: 0.9 }}
              >
                {isPublish ? (
                  <motion.div 
                    className="gradient-primary p-3 rounded-full -mt-6 shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <item.icon className="w-6 h-6 text-primary-foreground" />
                  </motion.div>
                ) : (
                  <>
                    <div className="relative">
                      <item.icon 
                        className={`w-5 h-5 transition-all duration-300 ${
                          isActive 
                            ? 'text-primary fill-primary' 
                            : 'text-muted-foreground fill-none'
                        }`} 
                        strokeWidth={isActive ? 2.5 : 1.5}
                      />
                      {showBadge && (
                        <span className="absolute -top-2 -right-2 min-w-4 h-4 bg-primary rounded-full flex items-center justify-center text-[10px] text-primary-foreground font-bold px-1">
                          {totalUnread > 99 ? '99+' : totalUnread}
                        </span>
                      )}
                    </div>
                    <span className={`text-xs font-medium transition-all duration-300 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                      {item.label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute -bottom-1 w-1 h-1 rounded-full gradient-primary"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </motion.div>
            </RouterNavLink>
          );
        })}
      </div>
    </motion.nav>
  );
};