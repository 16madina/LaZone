import { Button } from "@/components/ui/button";
import CountrySelector from "@/components/CountrySelector";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import ChatSystem from "@/components/chat/ChatSystem";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Crown } from "lucide-react";

interface HeaderProps {}

export default function Header({}: HeaderProps) {
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

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
    // Pour l'instant, juste un log - peut être étendu plus tard
    console.log('Notifications clicked');
    // Vous pouvez naviguer vers une page de notifications ou ouvrir un dropdown
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
            <NotificationCenter />
            <ChatSystem />
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
    </header>
  );
}