import React from 'react';
import { useLocation } from 'react-router-dom';
import BottomNav from './nav/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { useUnreadCounts } from '@/hooks/useUnreadCounts';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  const { messages: messagesCount } = useUnreadCounts();
  
  // Hide bottom nav on specific pages
  const hideBottomNav = location.pathname.startsWith('/auth') || 
                       location.pathname.startsWith('/property/');

  return (
    <div className="min-h-screen bg-background">
      {children}
      
      {/* Bottom Navigation - Hidden on specific pages */}
      {!hideBottomNav && (
        <BottomNav 
          messagesCount={messagesCount} 
          isAuthenticated={!!user} 
          hasProfileNotification={false}
        />
      )}
    </div>
  );
};

export default Layout;