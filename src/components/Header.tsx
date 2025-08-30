import { Button } from "@/components/ui/button";
import CountrySelector from "@/components/CountrySelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Bell, Crown } from "lucide-react";
import { useState } from "react";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";

interface HeaderProps {}

export default function Header({}: HeaderProps) {
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

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
    <header className="sticky top-0 z-50 w-full border-b bg-gradient-card backdrop-blur-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Country Selector */}
            <CountrySelector variant="compact" />
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={handleLanguageToggle}>
              {t('nav.language')}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleNotificationClick}
              className="p-2"
            >
              <Bell className="w-5 h-5" />
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