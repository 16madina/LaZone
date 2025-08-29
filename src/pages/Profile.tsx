import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut,
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  Camera
} from 'lucide-react';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated] = useState(false); // Mock - replace with real auth state
  const [notifications, setNotifications] = useState(true);

  // Mock user data
  const userData = {
    name: 'John Doe',
    email: 'john.doe@example.com', 
    phone: '+225 07 00 00 00',
    location: 'Abidjan, Côte d\'Ivoire',
    avatar: '/placeholder.svg',
    verified: false,
    memberSince: '2024',
    favoriteCount: 12,
    listingCount: 0
  };

  const handleLogin = () => {
    navigate('/auth?next=' + encodeURIComponent('/profile'));
  };

  const menuItems = [
    {
      icon: Bell,
      label: 'Notifications',
      action: () => {},
      hasSwitch: true,
      switchValue: notifications,
      onSwitchChange: setNotifications
    },
    {
      icon: Settings,
      label: 'Paramètres du compte',
      action: () => navigate('/settings')
    },
    {
      icon: Shield,
      label: 'Vérification du compte',
      action: () => navigate('/verification'),
      badge: !userData.verified ? 'Action requise' : undefined,
      badgeVariant: 'destructive' as const
    },
    {
      icon: HelpCircle,
      label: 'Aide et support',
      action: () => navigate('/help')
    }
  ];

  // Guest/unauthenticated view
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="sticky top-0 z-10 bg-background border-b border-border">
          <div className="flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              aria-label="Retour"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">Profil</h1>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center h-96 text-center p-6">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
            <User className="w-10 h-10 text-muted-foreground" />
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Bienvenue sur LaZone</h2>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Connectez-vous pour accéder à vos favoris, gérer vos annonces et profiter de toutes les fonctionnalités.
          </p>
          
          <div className="space-y-3 w-full max-w-sm">
            <Button onClick={handleLogin} className="w-full">
              Se connecter
            </Button>
            <Button variant="outline" onClick={() => navigate('/auth?mode=register')} className="w-full">
              Créer un compte
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated user view
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            aria-label="Retour"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Profil</h1>
          <Button variant="ghost" size="sm">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* User Info Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-muted rounded-full overflow-hidden">
                  <img 
                    src={userData.avatar} 
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button 
                  size="icon" 
                  variant="secondary"
                  className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full"
                >
                  <Camera className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-semibold">{userData.name}</h2>
                  {!userData.verified && (
                    <Badge variant="outline" className="text-orange-600 border-orange-200">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Non vérifié
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    <span>{userData.email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    <span>{userData.phone}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{userData.location}</span>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground mt-2">
                  Membre depuis {userData.memberSince}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="w-4 h-4 text-primary" />
                <span className="text-2xl font-bold">{userData.favoriteCount}</span>
              </div>
              <p className="text-sm text-muted-foreground">Favoris</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold mb-1">{userData.listingCount}</div>
              <p className="text-sm text-muted-foreground">Mes annonces</p>
            </CardContent>
          </Card>
        </div>

        {/* Menu */}
        <Card>
          <CardContent className="p-0">
            {menuItems.map((item, index) => (
              <div key={item.label}>
                <button
                  onClick={item.action}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <Badge variant={item.badgeVariant || 'secondary'}>
                        {item.badge}
                      </Badge>
                    )}
                    {item.hasSwitch ? (
                      <Switch 
                        checked={item.switchValue}
                        onCheckedChange={item.onSwitchChange}
                      />
                    ) : (
                      <span className="text-muted-foreground">›</span>
                    )}
                  </div>
                </button>
                {index < menuItems.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Logout */}
        <Button variant="outline" className="w-full justify-start text-destructive" size="lg">
          <LogOut className="w-4 h-4 mr-2" />
          Se déconnecter
        </Button>
      </div>
    </div>
  );
};

export default Profile;