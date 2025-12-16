import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      // Check if we have a session - email verification happens automatically via Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user?.email_confirmed_at) {
        setSuccess(true);
      }
      
      setVerifying(false);
      
      // Redirect to profile after 3 seconds
      setTimeout(() => {
        navigate('/profile');
      }, 3000);
    };

    verifyEmail();
  }, [navigate, searchParams]);

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
              Votre compte a été vérifié avec succès. Vous allez être redirigé vers votre profil.
            </p>
          </>
        ) : (
          <>
            <div className="text-6xl my-6">📧</div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Vérification d'email
            </h2>
            <p className="text-muted-foreground mb-4">
              Connectez-vous pour vérifier votre email. Vous allez être redirigé.
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;
