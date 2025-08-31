import { supabase } from "@/integrations/supabase/client";

export interface AgentInfo {
  name: string;
  avatar: string;
  isVerified: boolean;
}

export interface AgentInfoWithPhone extends AgentInfo {
  phone?: string;
}

export const getAgentInfo = async (userId: string): Promise<AgentInfo> => {
  const defaultAgent: AgentInfo = {
    name: 'Propriétaire',
    avatar: '/placeholder.svg',
    isVerified: false
  };

  if (!userId) return defaultAgent;

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, user_type, agency_name, agent_verified, phone')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (!profile) return defaultAgent;

    let agentName = 'Propriétaire';
    if (profile.user_type === 'agence' && profile.agency_name) {
      agentName = profile.agency_name;
    } else if (profile.first_name || profile.last_name) {
      const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
      agentName = fullName || 'Propriétaire';
    }

    return {
      name: agentName,
      avatar: '/placeholder.svg',
      isVerified: profile.agent_verified || false
    };
  } catch (error) {
    console.error('Error fetching agent info:', error);
    return defaultAgent;
  }
};

export const getAgentInfoWithPhone = async (userId: string): Promise<AgentInfoWithPhone> => {
  const defaultAgent: AgentInfoWithPhone = {
    name: 'Propriétaire',
    avatar: '/placeholder.svg',
    isVerified: false,
    phone: undefined
  };

  if (!userId) return defaultAgent;

  try {
    console.log('Fetching agent info for userId:', userId);
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('first_name, last_name, user_type, agency_name, agent_verified, phone')
      .eq('user_id', userId)
      .maybeSingle();
    
    console.log('Profile data:', profile);
    console.log('Profile error:', error);
    
    if (!profile) {
      console.log('No profile found, returning default agent');
      return defaultAgent;
    }

    let agentName = 'Propriétaire';
    if (profile.user_type === 'agence' && profile.agency_name) {
      agentName = profile.agency_name;
    } else if (profile.first_name || profile.last_name) {
      const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
      agentName = fullName || 'Propriétaire';
    }

    console.log('Final agent name:', agentName);
    console.log('Final phone:', profile.phone);

    return {
      name: agentName,
      avatar: '/placeholder.svg',
      isVerified: profile.agent_verified || false,
      phone: profile.phone
    };
  } catch (error) {
    console.error('Error fetching agent info:', error);
    return defaultAgent;
  }
};