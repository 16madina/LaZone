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
      .select('display_name, avatar_url, user_type, first_name, last_name, agency_name, email')
      .eq('user_id', userId)
      .maybeSingle();
    
    console.log('📊 Agent info response:', { profile, error });
    
    if (error) {
      console.error('❌ Database error fetching profile:', error);
      return defaultAgent;
    }

    if (!profile) {
      console.log('⚠️ Profile not found for userId:', userId);
      // Try to get user info from auth.users and create a minimal profile
      try {
        const { data: { user }, error: authError } = await supabase.auth.admin.getUserById(userId);
        if (user && !authError) {
          console.log('📝 Creating minimal profile for user:', user.email);
          // The trigger should handle this now, but as a fallback
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              user_id: userId,
              email: user.email,
              first_name: user.user_metadata?.first_name,
              last_name: user.user_metadata?.last_name,
              user_type: user.user_metadata?.user_type || 'particulier',
              account_status: 'active'
            })
            .select('display_name, avatar_url, user_type, first_name, last_name, agency_name, email')
            .single();
            
          if (!insertError && newProfile) {
            const displayName = newProfile.display_name || 
              (newProfile.first_name && newProfile.last_name ? `${newProfile.first_name} ${newProfile.last_name}` : '') ||
              newProfile.email ||
              'Propriétaire';
            
            return {
              name: displayName,
              avatar: newProfile.avatar_url || '/placeholder.svg',
              isVerified: false,
              type: (newProfile.user_type as 'particulier' | 'agence' | 'démarcheur') || 'particulier',
              agencyName: newProfile.user_type === 'agence' ? newProfile.agency_name : undefined
            };
          }
        }
      } catch (createError) {
        console.error('❌ Error creating profile:', createError);
      }
      
      return defaultAgent;
    }

    const displayName = profile.display_name || 
      (profile.first_name && profile.last_name ? `${profile.first_name} ${profile.last_name}` : '') ||
      profile.agency_name ||
      profile.email ||
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