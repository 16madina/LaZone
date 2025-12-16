import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  Heart, 
  Home, 
  Bell, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  Star,
  Eye,
  LogIn,
  BadgeCheck,
  XCircle,
  Mail,
  Loader2
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const menuItems = [
  { icon: Heart, label: 'Mes favoris', badge: null, color: 'text-destructive' },
  { icon: Home, label: 'Mes annonces', badge: '0', color: 'text-primary' },
  { icon: Eye, label: 'Vues récentes', badge: null, color: 'text-secondary' },
  { icon: Bell, label: 'Notifications', badge: '0', color: 'text-accent' },
  { icon: Star, label: 'Avis reçus', badge: null, color: 'text-yellow-500' },
  { icon: Settings, label: 'Paramètres', badge: null, color: 'text-muted-foreground' },
  { icon: HelpCircle, label: 'Aide & Support', badge: null, color: 'text-muted-foreground' },
];

const ProfilePage = () => {
  const navigate = useNavigate();
  const { favorites } = useAppStore();
  const { user, signOut, loading, isEmailVerified, resendVerificationEmail } = useAuth();
  const [sendingEmail, setSendingEmail] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleResendVerification = async () => {
    setSendingEmail(true);
    const result = await resendVerificationEmail();
    setSendingEmail(false);
    
    if (result.success) {
      toast({
        title: 'Email envoyé',
        description: 'Un nouveau lien de vérification vous a été envoyé.',
      });
    } else {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer l\'email. Veuillez réessayer.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="page-container">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 mb-6 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="relative inline-block mb-4"
        >
          <div className="w-24 h-24 rounded-full gradient-primary p-1">
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
              {user?.user_metadata?.avatar_url ? (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl">👤</span>
              )}
            </div>
          </div>
          {user && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="absolute bottom-0 right-0 w-8 h-8 gradient-primary rounded-full flex items-center justify-center shadow-lg"
            >
              <Settings className="w-4 h-4 text-primary-foreground" />
            </motion.button>
          )}
        </motion.div>

        {loading ? (
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded w-32 mx-auto mb-2" />
            <div className="h-4 bg-muted rounded w-48 mx-auto" />
          </div>
        ) : user ? (
          <>
            <div className="flex items-center justify-center gap-2 mb-1">
              <h2 className="font-display text-xl font-bold">
                {user.user_metadata?.full_name || 'Utilisateur'}
              </h2>
              {/* Verification Badge */}
              {isEmailVerified ? (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-xs font-medium">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  <span>Vérifié</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full text-xs font-medium">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Non vérifié</span>
                </div>
              )}
            </div>
            <p className="text-muted-foreground text-sm mb-2">{user.email}</p>
            
            {/* User details */}
            {user.user_metadata?.city && user.user_metadata?.country && (
              <p className="text-muted-foreground text-xs mb-2">
                📍 {user.user_metadata.city}, {user.user_metadata.country}
              </p>
            )}
            {user.user_metadata?.phone && (
              <p className="text-muted-foreground text-xs mb-4">
                📱 {user.user_metadata.phone}
              </p>
            )}

            {/* Resend Verification Email Button */}
            {!isEmailVerified && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleResendVerification}
                disabled={sendingEmail}
                className="flex items-center justify-center gap-2 px-4 py-2 mx-auto bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-600 dark:text-amber-400 text-sm font-medium transition-colors disabled:opacity-50"
              >
                {sendingEmail ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
                <span>{sendingEmail ? 'Envoi en cours...' : 'Renvoyer l\'email de vérification'}</span>
              </motion.button>
            )}
          </>
        ) : (
          <>
            <h2 className="font-display text-xl font-bold mb-1">Invité</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Connectez-vous pour accéder à toutes les fonctionnalités
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate('/auth')}
              className="gradient-primary px-6 py-3 rounded-xl text-primary-foreground font-medium w-full flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Se connecter
            </motion.button>
          </>
        )}
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-3 gap-3 mb-6"
      >
        <div className="glass-card p-4 text-center">
          <p className="font-display font-bold text-2xl gradient-text">{favorites.length}</p>
          <p className="text-xs text-muted-foreground">Favoris</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="font-display font-bold text-2xl gradient-text">0</p>
          <p className="text-xs text-muted-foreground">Annonces</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="font-display font-bold text-2xl gradient-text">0</p>
          <p className="text-xs text-muted-foreground">Messages</p>
        </div>
      </motion.div>

      {/* Menu Items */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="glass-card overflow-hidden"
      >
        {menuItems.map((item, index) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.05 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors border-b border-border last:border-b-0"
          >
            <div className={`p-2 rounded-xl glass ${item.color}`}>
              <item.icon className="w-5 h-5" />
            </div>
            <span className="flex-1 text-left font-medium">{item.label}</span>
            {item.badge && (
              <span className="px-2 py-0.5 gradient-primary rounded-full text-xs text-primary-foreground font-bold">
                {item.badge}
              </span>
            )}
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </motion.button>
        ))}
      </motion.div>

      {/* Logout Button */}
      {user && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSignOut}
          className="w-full mt-6 glass-card p-4 flex items-center justify-center gap-2 text-destructive font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span>Se déconnecter</span>
        </motion.button>
      )}

      {/* App Version */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center text-xs text-muted-foreground mt-6"
      >
        LaZone v1.0.0
      </motion.p>
    </div>
  );
};

export default ProfilePage;
