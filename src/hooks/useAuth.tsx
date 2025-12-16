import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isEmailVerified: boolean;
  signOut: () => Promise<void>;
  resendVerificationEmail: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isEmailVerified: false,
  signOut: async () => {},
  resendVerificationEmail: async () => ({ success: false }),
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const isEmailVerified = !!user?.email_confirmed_at;

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const resendVerificationEmail = async () => {
    if (!user?.email) return { success: false, error: 'No email found' };
    
    try {
      const firstName = user.user_metadata?.first_name || 'Utilisateur';
      const verificationUrl = `${window.location.origin}/verify-email?email=${encodeURIComponent(user.email)}`;
      
      const { error } = await supabase.functions.invoke('send-verification-email', {
        body: {
          email: user.email,
          firstName,
          verificationUrl,
        },
      });
      
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error sending verification email:', error);
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isEmailVerified, signOut, resendVerificationEmail }}>
      {children}
    </AuthContext.Provider>
  );
};
