import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

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
        logger.error('Error checking subscription', subError as Error, { 
          component: 'SubscriptionContext',
          userId: user.id 
        });
        setSubscription({ subscribed: false });
        return;
      }

      // Use mock subscription data since subscribers table doesn't exist
      const mockSubscriptionData = {
        subscribed: true,
        subscription_type: 'premium',
        subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        listings_remaining: 10,
        can_create_listing: true
      };

      setSubscription(mockSubscriptionData);
    } catch (error) {
      logger.error('Error refreshing subscription', error as Error, { 
        component: 'SubscriptionContext',
        userId: user?.id 
      });
      setSubscription({ subscribed: false });
    } finally {
      setLoading(false);
    }
  };

  const checkCanCreateListing = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      // Return true for now since we don't have the RPC functions
      return true;
    } catch (error) {
      logger.error('Error checking can create listing', error as Error, {
        component: 'SubscriptionContext',
        userId: user?.id
      });
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