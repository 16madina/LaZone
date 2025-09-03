import { supabase } from "@/integrations/supabase/client";

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
    // Use the secure function for public agent data access
    const { data: profiles, error } = await supabase.rpc('get_public_profile_data', {
      profile_user_id: userId
    });
    
    if (error || !profiles || profiles.length === 0) return defaultAgent;

    const profile = profiles[0];
    let agentName = 'Propriétaire';
    if (profile.first_name && profile.last_name) {
      // Toujours afficher le nom complet de la personne
      agentName = `${profile.first_name} ${profile.last_name}`;
    } else if (profile.first_name) {
      agentName = profile.first_name;
    } else if (profile.last_name) {
      agentName = profile.last_name;
    }

    return {
      name: agentName,
      avatar: profile.avatar_url || '/placeholder.svg',
      isVerified: profile.agent_verified || false,
      type: (profile.user_type as 'particulier' | 'agence' | 'démarcheur') || 'particulier',
      agencyName: profile.agency_name
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
    phone: undefined,
    type: 'particulier'
  };

  if (!userId) return defaultAgent;

  try {
    // Note: Phone numbers are sensitive data. This function should only be used
    // in contexts where phone access is appropriate (e.g., authenticated inquiries)
    const { data: profiles, error } = await supabase.rpc('get_public_profile_data', {
      profile_user_id: userId
    });
    
    if (error || !profiles || profiles.length === 0) {
      return defaultAgent;
    }

    const profile = profiles[0];
    let agentName = 'Propriétaire';
    if (profile.first_name && profile.last_name) {
      // Toujours afficher le nom complet de la personne
      agentName = `${profile.first_name} ${profile.last_name}`;
    } else if (profile.first_name) {
      agentName = profile.first_name;
    } else if (profile.last_name) {
      agentName = profile.last_name;
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
    console.error('Error fetching agent info:', error);
    return defaultAgent;
  }
};