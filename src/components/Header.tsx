import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CountrySelector from "@/components/CountrySelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Bell, Crown, ExternalLink } from "lucide-react";
import { useState } from "react";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { useUnreadCounts } from "@/hooks/useUnreadCounts";

interface HeaderProps {}

export default function Header({}: HeaderProps) {
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications: notificationsCount } = useUnreadCounts();

  const handleLanguageToggle = () => {
    setLanguage(language === 'fr' ? 'en' : 'fr');
  };

  const handleAuthClick = () => {
    if (user) {
      navigate('/profile');
    } else {
      navigate('/auth');
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(true);
  };

  const handleSubscriptionClick = () => {
    navigate('/subscription');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-gradient-card backdrop-blur-md safe-area-top">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Country Selector */}
            <CountrySelector variant="compact" />
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/integrations')}
              className="hidden md:flex"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Services
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLanguageToggle}>
              {t('nav.language')}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleNotificationClick}
              className="p-2 relative"
            >
              <Bell className="w-5 h-5" />
              {notificationsCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs animate-pulse"
                >
                  {notificationsCount > 99 ? '99+' : notificationsCount}
                </Badge>
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSubscriptionClick}
              className="p-2 text-yellow-600 hover:text-yellow-700"
            >
              <Crown className="w-5 h-5" />
            </Button>
            <div className="w-px h-6 bg-border"></div>
            <Button variant="ghost" size="sm" onClick={handleAuthClick}>
              {user ? 'Profil' : t('nav.login')}
            </Button>
          </div>
        </div>
      </div>

      <NotificationCenter 
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </header>
  );
}