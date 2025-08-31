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
    } else if (profile.first_name && profile.last_name) {
      // Pour les particuliers, toujours afficher le nom complet
      agentName = `${profile.first_name} ${profile.last_name}`;
    } else if (profile.first_name) {
      agentName = profile.first_name;
    } else if (profile.last_name) {
      agentName = profile.last_name;
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
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('first_name, last_name, user_type, agency_name, agent_verified, phone')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (!profile) {
      return defaultAgent;
    }

    let agentName = 'Propriétaire';
    if (profile.user_type === 'agence' && profile.agency_name) {
      agentName = profile.agency_name;
    } else if (profile.first_name && profile.last_name) {
      // Pour les particuliers, toujours afficher le nom complet
      agentName = `${profile.first_name} ${profile.last_name}`;
    } else if (profile.first_name) {
      agentName = profile.first_name;
    } else if (profile.last_name) {
      agentName = profile.last_name;
    }

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