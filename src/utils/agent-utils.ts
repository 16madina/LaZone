import { supabase } from "@/integrations/supabase/client";
import { logger } from './logger';

export interface AgentInfo {
  name: string;
  avatar: string;
  isVerified: boolean;
  type?: 'particulier' | 'agence' | 'démarcheur';
  agencyName?: string;
}

export interface AgentInfoWithPhone extends AgentInfo {
  phone?: string;
}

export const getAgentInfo = async (userId: string): Promise<AgentInfo> => {
  const defaultAgent: AgentInfo = {
    name: 'Propriétaire',
    avatar: '/placeholder.svg',
    isVerified: false,
    type: 'particulier'
  };

  if (!userId) return defaultAgent;

  try {
    console.log('🔍 Fetching agent info for userId:', userId);
    // Use secure function to get safe profile data
    const { data, error } = await supabase.rpc('get_safe_listing_profile', {
      profile_user_id: userId
    });
    
    console.log('📊 Agent info response:', { data, error });
    
    if (error || !data || data.length === 0) {
      console.log('⚠️ Profile not found or error:', error);
      return defaultAgent;
    }

    const profile = data[0]; // Function returns array, get first result
    console.log('✅ Agent profile found:', profile.display_name, 'Type:', profile.user_type);

    return {
      name: profile.display_name || 'Propriétaire',
      avatar: profile.avatar_url || '/placeholder.svg',
      isVerified: profile.agent_verified || false,
      type: (profile.user_type as 'particulier' | 'agence' | 'démarcheur') || 'particulier',
      agencyName: profile.user_type === 'agence' ? profile.display_name : undefined
    };
  } catch (error) {
    console.error('❌ Error in getAgentInfo:', error);
    logger.error('Error fetching agent info', error as Error, { 
      component: 'agent-utils',
      userId 
    });
    return defaultAgent;
  }
};

export const getAgentInfoWithPhone = async (userId: string): Promise<AgentInfoWithPhone> => {
  const defaultAgent: AgentInfoWithPhone = {
    name: 'Propriétaire',
    avatar: '/placeholder.svg',
    isVerified: false,
    phone: undefined,
    type: 'particulier'
  };

  if (!userId) return defaultAgent;

  try {
    // For phone info, authenticated users only should access this
    // Use basic agent info for now since phone requires authentication
    const basicInfo = await getAgentInfo(userId);
    
    return {
      ...basicInfo,
      phone: undefined // Phone info requires authentication
    };
  } catch (error) {
    logger.error('Error fetching agent info with phone', error as Error, { 
      component: 'agent-utils',
      userId 
    });
    return defaultAgent;
  }
};