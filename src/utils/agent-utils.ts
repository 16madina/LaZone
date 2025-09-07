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
    // Query profiles table directly
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('display_name, avatar_url, user_type, first_name, last_name, agency_name')
      .eq('user_id', userId)
      .maybeSingle();
    
    console.log('📊 Agent info response:', { profile, error });
    
    if (error || !profile) {
      console.log('⚠️ Profile not found or error:', error);
      return defaultAgent;
    }

    const displayName = profile.display_name || 
      (profile.first_name && profile.last_name ? `${profile.first_name} ${profile.last_name}` : '') ||
      profile.agency_name ||
      'Propriétaire';

    console.log('✅ Agent profile found:', displayName, 'Type:', profile.user_type);

    return {
      name: displayName,
      avatar: profile.avatar_url || '/placeholder.svg',
      isVerified: false, // We don't have agent_verified field
      type: (profile.user_type as 'particulier' | 'agence' | 'démarcheur') || 'particulier',
      agencyName: profile.user_type === 'agence' ? profile.agency_name : undefined
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