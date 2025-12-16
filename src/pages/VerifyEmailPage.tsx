import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshVerificationStatus } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setError('Token de vérification manquant');
        setVerifying(false);
        return;
      }

      try {
        const { data, error: fnError } = await supabase.functions.invoke('verify-email', {
          body: { token },
        });

        if (fnError) throw fnError;

        if (data?.success) {
          setSuccess(true);
          // Refresh the verification status in auth context
          await refreshVerificationStatus();
        } else {
          setError(data?.error || 'Erreur de vérification');
        }
      } catch (err: any) {
        console.error('Verification error:', err);
        setError(err.message || 'Une erreur est survenue');
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams, refreshVerificationStatus]);

  useEffect(() => {
    // Redirect to profile after 4 seconds if successful
    if (success) {
      const timer = setTimeout(() => {
        navigate('/profile');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 text-center max-w-md w-full"
      >
        <div className="text-6xl mb-6">🏠</div>
        <h1 className="font-display text-2xl font-bold gradient-text mb-2">LaZone</h1>
        
        {verifying ? (
          <>
            <Loader2 className="w-12 h-12 text-primary mx-auto my-6 animate-spin" />
            <p className="text-muted-foreground">Vérification en cours...</p>
          </>
        ) : success ? (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto my-6" />
            </motion.div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Email vérifié !
            </h2>
            <p className="text-muted-foreground mb-4">
              Votre compte a été vérifié avec succès. Vous avez maintenant le badge vérifié !
            </p>
            <p className="text-sm text-muted-foreground">
              Redirection vers votre profil...
            </p>
          </>
        ) : (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              <XCircle className="w-16 h-16 text-destructive mx-auto my-6" />
            </motion.div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Erreur de vérification
            </h2>
            <p className="text-muted-foreground mb-4">
              {error}
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/profile')}
              className="gradient-primary px-6 py-3 rounded-xl text-primary-foreground font-medium"
            >
              Retour au profil
            </motion.button>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;
