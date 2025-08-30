import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionData {
  subscribed: boolean;
  subscription_type?: string;
  subscription_end?: string;
  listings_remaining?: number;
  can_create_listing?: boolean;
}

interface SubscriptionContextType {
  subscription: SubscriptionData | null;
  loading: boolean;
  refreshSubscription: () => Promise<void>;
  checkCanCreateListing: () => Promise<boolean>;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscription: null,
  loading: true,
  refreshSubscription: async () => {},
  checkCanCreateListing: async () => false,
});

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

interface SubscriptionProviderProps {
  children: React.ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const { user, session } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSubscription = async () => {
    if (!user || !session) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Check subscription status
      const { data: subData, error: subError } = await supabase.functions.invoke('check-subscription');
      
      if (subError) {
        console.error('Error checking subscription:', subError);
        setSubscription({ subscribed: false });
        return;
      }

      // Get subscription data from database
      const { data: dbData, error: dbError } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (dbError) {
        console.error('Error fetching subscription from DB:', dbError);
      }

      // Vérifier si l'utilisateur est admin
      const { data: isAdmin, error: roleError } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'admin' });

      // Check if user can create listing
      const { data: canCreateData, error: canCreateError } = await supabase
        .rpc('can_create_listing', { user_id_param: user.id });

      if (canCreateError) {
        console.error('Error checking can create listing:', canCreateError);
      }

      setSubscription({
        subscribed: subData?.subscribed || isAdmin || false, // Les admins sont considérés comme "abonnés" pour l'UI
        subscription_type: isAdmin ? 'admin' : (subData?.subscription_type || dbData?.subscription_type),
        subscription_end: subData?.subscription_end || dbData?.subscription_end,
        listings_remaining: isAdmin ? 999999 : (dbData?.listings_remaining || 0), // Nombre illimité pour les admins
        can_create_listing: canCreateData || false,
      });
    } catch (error) {
      console.error('Error refreshing subscription:', error);
      setSubscription({ subscribed: false });
    } finally {
      setLoading(false);
    }
  };

  const checkCanCreateListing = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      // Vérifier d'abord si l'utilisateur est admin
      const { data: isAdmin, error: roleError } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'admin' });

      if (!roleError && isAdmin) {
        return true; // Les admins peuvent toujours créer des annonces
      }

      const { data, error } = await supabase
        .rpc('can_create_listing', { user_id_param: user.id });

      if (error) {
        console.error('Error checking can create listing:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Error checking can create listing:', error);
      return false;
    }
  };

  useEffect(() => {
    refreshSubscription();
  }, [user, session]);

  return (
    <SubscriptionContext.Provider value={{
      subscription,
      loading,
      refreshSubscription,
      checkCanCreateListing,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};