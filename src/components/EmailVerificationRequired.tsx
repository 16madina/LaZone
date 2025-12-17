import { motion } from 'framer-motion';
import { Mail, Shield, Send, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface EmailVerificationRequiredProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

const EmailVerificationRequired = ({ 
  title, 
  description,
  icon 
}: EmailVerificationRequiredProps) => {
  const { user, resendVerificationEmail } = useAuth();
  const [sending, setSending] = useState(false);

  const handleResend = async () => {
    setSending(true);
    const result = await resendVerificationEmail();
    setSending(false);
    
    if (result.success) {
      toast({
        title: 'Email envoyé!',
        description: 'Vérifiez votre boîte mail pour confirmer votre adresse.',
      });
    } else {
      toast({
        title: 'Erreur',
        description: result.error || 'Impossible d\'envoyer l\'email',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      {/* Animated icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative mb-8"
      >
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center backdrop-blur-sm border border-amber-500/20">
          <motion.div
            animate={{ 
              y: [0, -8, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            {icon || <Mail className="w-16 h-16 text-amber-500" strokeWidth={1.5} />}
          </motion.div>
        </div>
        {/* Warning badge */}
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-1 -right-1 w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center shadow-lg"
        >
          <AlertTriangle className="w-5 h-5 text-white" />
        </motion.div>
      </motion.div>

      {/* Title and description */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-8"
      >
        <h2 className="font-display text-2xl font-bold mb-2">{title}</h2>
        <p className="text-muted-foreground max-w-sm">{description}</p>
      </motion.div>

      {/* Info card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-5 w-full max-w-sm mb-6"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="font-medium text-sm">Sécurité renforcée</p>
              <p className="text-xs text-muted-foreground">Protégez votre compte</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="font-medium text-sm">Vérifiez votre email</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Resend button */}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        onClick={handleResend}
        disabled={sending}
        className="w-full max-w-sm gradient-primary py-4 rounded-2xl text-primary-foreground font-display font-semibold shadow-lg disabled:opacity-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        {sending ? (
          <span className="flex items-center gap-2">
            <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Envoi...
          </span>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Renvoyer l'email de vérification
          </>
        )}
      </motion.button>

      {/* Helper text */}
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center text-xs text-muted-foreground mt-4 max-w-sm"
      >
        Vérifiez également vos spams si vous ne trouvez pas l'email. Le lien expire après 24 heures.
      </motion.p>
    </div>
  );
};

export default EmailVerificationRequired;
