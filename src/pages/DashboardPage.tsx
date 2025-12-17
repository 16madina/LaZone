import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Home, 
  Heart, 
  MessageCircle, 
  Calendar, 
  Eye,
  TrendingUp,
  Users,
  Star,
  Building2,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useProperties } from '@/hooks/useProperties';
import { useFavorites } from '@/hooks/useFavorites';
import { useMessages } from '@/hooks/useMessages';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalProperties: number;
  activeProperties: number;
  totalFavorites: number;
  totalMessages: number;
  unreadMessages: number;
  totalAppointments: number;
  pendingAppointments: number;
  totalViews: number;
  averageRating: number;
  totalReviews: number;
  followers: number;
  following: number;
}

const DashboardPage = () => {
  const { user, profile } = useAuth();
  const { properties } = useProperties();
  const { favorites } = useFavorites();
  const { totalUnread } = useMessages();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchStats = async () => {
      setLoading(true);
      try {
        // Get user's properties (already filtered for active in useProperties)
        const userProperties = properties.filter(p => p.userId === user.id);

        // Get appointments
        const { data: appointments } = await supabase
          .from('appointments')
          .select('id, status')
          .or(`owner_id.eq.${user.id},requester_id.eq.${user.id}`);

        const pendingAppointments = appointments?.filter(a => a.status === 'pending').length || 0;

        // Get reviews
        const { data: reviews } = await supabase
          .from('user_reviews')
          .select('rating')
          .eq('reviewed_user_id', user.id);

        const averageRating = reviews && reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0;

        // Get followers/following
        const { count: followersCount } = await supabase
          .from('user_follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', user.id);

        const { count: followingCount } = await supabase
          .from('user_follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', user.id);

        // Get messages count
        const { count: messagesCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

        setStats({
          totalProperties: userProperties.length,
          activeProperties: userProperties.length, // All returned properties are active
          totalFavorites: favorites.length,
          totalMessages: messagesCount || 0,
          unreadMessages: totalUnread,
          totalAppointments: appointments?.length || 0,
          pendingAppointments,
          totalViews: 0, // Would need view tracking
          averageRating,
          totalReviews: reviews?.length || 0,
          followers: followersCount || 0,
          following: followingCount || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, properties, favorites, totalUnread, navigate]);

  if (!user) return null;

  const statCards = [
    {
      icon: Building2,
      label: 'Mes annonces',
      value: stats?.totalProperties || 0,
      subValue: `${stats?.activeProperties || 0} actives`,
      color: 'bg-blue-500',
      link: '/my-listings'
    },
    {
      icon: Heart,
      label: 'Favoris',
      value: stats?.totalFavorites || 0,
      subValue: 'propriétés sauvegardées',
      color: 'bg-red-500',
      link: '/profile'
    },
    {
      icon: MessageCircle,
      label: 'Messages',
      value: stats?.totalMessages || 0,
      subValue: `${stats?.unreadMessages || 0} non lus`,
      color: 'bg-green-500',
      link: '/messages'
    },
    {
      icon: Calendar,
      label: 'Rendez-vous',
      value: stats?.totalAppointments || 0,
      subValue: `${stats?.pendingAppointments || 0} en attente`,
      color: 'bg-orange-500',
      link: '/profile'
    },
    {
      icon: Star,
      label: 'Note moyenne',
      value: stats?.averageRating.toFixed(1) || '0.0',
      subValue: `${stats?.totalReviews || 0} avis`,
      color: 'bg-yellow-500',
      link: '/profile'
    },
    {
      icon: Users,
      label: 'Communauté',
      value: stats?.followers || 0,
      subValue: `${stats?.following || 0} abonnements`,
      color: 'bg-purple-500',
      link: '/followers'
    },
  ];

  return (
    <div className="min-h-screen pb-32 bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-4 px-4 py-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Tableau de bord</h1>
        </div>
      </header>

      <div className="px-4 py-6">
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 mb-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <Home className="w-8 h-8 text-primary" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold">
                Bonjour, {profile?.full_name?.split(' ')[0] || 'Utilisateur'}!
              </h2>
              <p className="text-muted-foreground text-sm">
                Voici un aperçu de votre activité
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {statCards.map((card, index) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link 
                  to={card.link}
                  className="glass-card p-4 block hover:shadow-lg transition-all"
                >
                  <div className={`w-10 h-10 rounded-full ${card.color} flex items-center justify-center mb-3`}>
                    <card.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{card.subValue}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6"
        >
          <h3 className="font-semibold mb-4">Actions rapides</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link 
              to="/publish"
              className="glass-card p-4 flex items-center gap-3 hover:bg-primary/5 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <span className="font-medium text-sm">Publier une annonce</span>
            </Link>
            <Link 
              to="/messages"
              className="glass-card p-4 flex items-center gap-3 hover:bg-primary/5 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-primary" />
              </div>
              <span className="font-medium text-sm">Voir messages</span>
            </Link>
            <Link 
              to="/map"
              className="glass-card p-4 flex items-center gap-3 hover:bg-primary/5 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <span className="font-medium text-sm">Explorer la carte</span>
            </Link>
            <Link 
              to="/settings/edit-profile"
              className="glass-card p-4 flex items-center gap-3 hover:bg-primary/5 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <span className="font-medium text-sm">Modifier profil</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
