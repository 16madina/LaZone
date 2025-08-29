import React from 'react';
import { useLocation } from 'react-router-dom';
import BottomNav from './nav/BottomNav';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  
  // Hide bottom nav on specific pages
  const hideBottomNav = location.pathname.startsWith('/auth') || 
                       location.pathname.startsWith('/property/');

  return (
    <div className="min-h-screen bg-background">
      {children}
      
      {/* Bottom Navigation - Hidden on specific pages */}
      {!hideBottomNav && (
        <BottomNav 
          favoritesCount={5} 
          isAuthenticated={false} 
          hasProfileNotification={false}
        />
      )}
    </div>
  );
};

export default Layout;