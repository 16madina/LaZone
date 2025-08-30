import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Home, Map, Plus, MessageCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChatSystem } from '@/components/chat/ChatSystem';

interface BottomNavProps {
  messagesCount?: number;
  isAuthenticated?: boolean;
  hasProfileNotification?: boolean;
}

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  activeIcon?: React.ComponentType<{ className?: string }>;
  protected?: boolean;
}

const navItems: NavItem[] = [
  {
    id: 'home',
    label: 'Accueil',
    path: '/',
    icon: Home,
  },
  {
    id: 'map',
    label: 'Carte', 
    path: '/map',
    icon: Map,
  },
  {
    id: 'new',
    label: 'Plus',
    path: '/new',
    icon: Plus,
    protected: true,
  },
  {
    id: 'messages',
    label: 'Messages',
    path: '/messages',
    icon: MessageCircle,
  },
  {
    id: 'profile',
    label: 'Profil',
    path: '/profile',
    icon: User,
  },
];

export const BottomNav: React.FC<BottomNavProps> = ({
  messagesCount = 0,
  isAuthenticated = false,
  hasProfileNotification = false,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showChat, setShowChat] = useState(false);
  
  const currentPath = location.pathname;

  const isActive = (itemPath: string) => {
    if (itemPath === '/') {
      return currentPath === '/' || currentPath === '/home';
    }
    return currentPath.startsWith(itemPath);
  };

  const handleNavigation = (item: NavItem) => {
    if (item.protected && !isAuthenticated) {
      navigate(`/auth?next=${encodeURIComponent(item.path)}`);
      return;
    }
    navigate(item.path);
  };

  const renderNavItem = (item: NavItem) => {
    const active = isActive(item.path);
    const IconComponent = item.activeIcon && active ? item.activeIcon : item.icon;
    
    // Central FAB for "Plus" button
    if (item.id === 'new') {
      return (
        <div key={item.id} className="relative">
          <Button
            onClick={() => handleNavigation(item)}
            size="icon"
            className="h-14 w-14 rounded-full bg-gradient-to-br from-primary via-primary to-primary/90 hover:from-primary/90 hover:via-primary hover:to-primary text-primary-foreground shadow-xl hover:shadow-2xl -mt-6 relative z-10 transition-all duration-300 hover:scale-105"
            aria-label={item.label}
          >
            <IconComponent className="h-6 w-6" />
          </Button>
        </div>
      );
    }

    return (
      <button
        key={item.id}
        onClick={() => handleNavigation(item)}
        className={`flex flex-col items-center justify-center px-3 py-2 min-h-[44px] relative transition-all duration-200 ${
          active 
            ? 'text-primary scale-105' 
            : 'text-muted-foreground hover:text-foreground hover:scale-105'
        }`}
        aria-label={item.label}
        aria-current={active ? 'page' : undefined}
      >
        <div className="relative">
          <IconComponent className={`h-5 w-5 mb-1 transition-all duration-200 ${
            active ? 'fill-current drop-shadow-sm' : ''
          }`} />
          
          {/* Messages badge */}
          {item.id === 'messages' && messagesCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs animate-pulse"
            >
              {messagesCount > 99 ? '99+' : messagesCount}
            </Badge>
          )}
          
          {/* Profile notification badge */}
          {item.id === 'profile' && hasProfileNotification && (
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full border-2 border-background animate-pulse" />
          )}
        </div>
        
        <span className={`text-xs font-medium transition-all duration-200 ${
          active ? 'text-primary font-semibold' : ''
        }`}>
          {item.label}
        </span>
      </button>
    );
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t border-border shadow-lg"
      style={{
        paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
      }}
      role="tablist"
      aria-label="Navigation principale"
    >
      <div className="flex items-end justify-around px-2 pt-2">
        {navItems.map(renderNavItem)}
      </div>
    </nav>
  );
};

export default BottomNav;