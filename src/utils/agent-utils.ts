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
    // Récupérer directement les informations du profil pour tous les types d'utilisateurs
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('first_name, last_name, agency_name, avatar_url, agent_verified, user_type, account_status')
      .eq('user_id', userId)
      .eq('account_status', 'active')
      .single();
    
    if (error || !profile) {
      console.log('Profile not found or error:', error);
      return defaultAgent;
    }

    let agentName = 'Propriétaire';
    if (profile.agency_name) {
      agentName = profile.agency_name;
    } else if (profile.first_name) {
      if (profile.last_name) {
        agentName = `${profile.first_name} ${profile.last_name}`;
      } else {
        agentName = profile.first_name;
      }
    }

    return {
      name: agentName,
      avatar: profile.avatar_url || '/placeholder.svg',
      isVerified: profile.agent_verified || false,
      type: (profile.user_type as 'particulier' | 'agence' | 'démarcheur') || 'particulier',
      agencyName: profile.agency_name
    };
  } catch (error) {
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
    // Note: This function now only returns public data without phone numbers
    // Phone numbers are sensitive data and are no longer exposed through public functions
    const { data: profiles, error } = await supabase.rpc('get_safe_public_profile', {
      profile_user_id: userId
    });
    
    if (error || !profiles || profiles.length === 0) {
      return defaultAgent;
    }

    const profile = profiles[0];
    let agentName = 'Propriétaire';
    if (profile.first_name) {
      // Only use first name for public display to protect privacy
      agentName = profile.first_name;
    } else if (profile.agency_name) {
      agentName = profile.agency_name;
    }

    return {
      name: agentName,
      avatar: profile.avatar_url || '/placeholder.svg',
      isVerified: profile.agent_verified || false,
      phone: undefined, // Phone numbers are no longer exposed for security
      type: (profile.user_type as 'particulier' | 'agence' | 'démarcheur') || 'particulier',
      agencyName: profile.agency_name
    };
  } catch (error) {
    logger.error('Error fetching agent info with phone', error as Error, { 
      component: 'agent-utils',
      userId 
    });
    return defaultAgent;
  }
};