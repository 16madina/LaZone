import { supabase } from "@/integrations/supabase/client";

export interface AgentInfo {
  name: string;
  avatar: string;
  isVerified: boolean;
}

export const getAgentInfo = async (userId: string): Promise<AgentInfo> => {
  const defaultAgent: AgentInfo = {
    name: 'Agent LaZone',
    avatar: '/placeholder.svg',
    isVerified: false
  };

  if (!userId) return defaultAgent;

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, user_type, agency_name, agent_verified')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (!profile) return defaultAgent;

    let agentName = 'Agent LaZone';
    if (profile.user_type === 'agence' && profile.agency_name) {
      agentName = profile.agency_name;
    } else if (profile.first_name || profile.last_name) {
      agentName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
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