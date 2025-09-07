import React from 'react';
import { InputSanitizer, InputValidator, RateLimiter, SecurityMonitor } from '@/utils/security';
import { useToast } from '@/hooks/use-toast';

interface SecureFormProps {
  children: React.ReactNode;
  onSubmit: (data: Record<string, string>) => Promise<void>;
  rateLimitKey?: string;
  className?: string;
}

/**
 * Secure form wrapper that handles input validation, sanitization, and rate limiting
 */
export const SecureForm: React.FC<SecureFormProps> = ({
  children,
  onSubmit,
  rateLimitKey = 'default',
  className = ''
}) => {
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Rate limiting check
    if (RateLimiter.isRateLimited(rateLimitKey)) {
      SecurityMonitor.logSuspiciousActivity('rate_limit_exceeded', {
        formKey: rateLimitKey,
        userAgent: navigator.userAgent
      });
      
      toast({
        title: "Trop de tentatives",
        description: "Veuillez attendre avant de réessayer.",
        variant: "destructive"
      });
      return;
    }

    const formData = new FormData(e.currentTarget);
    const sanitizedData: Record<string, string> = {};
    
    // Sanitize all form inputs
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') {
        switch (key) {
          case 'email':
            sanitizedData[key] = InputSanitizer.sanitizeEmail(value);
            break;
          case 'phone':
          case 'agency_phone':
          case 'responsible_mobile':
            sanitizedData[key] = InputSanitizer.sanitizePhone(value);
            break;
          case 'description':
          case 'additional_info':
            sanitizedData[key] = InputSanitizer.sanitizeHtml(value);
            break;
          default:
            sanitizedData[key] = InputSanitizer.sanitizeText(value);
        }
      }
    }

    // Basic validation
    for (const [key, value] of Object.entries(sanitizedData)) {
      if (key.includes('email') && value) {
        const validation = InputValidator.validateEmail(value);
        if (!validation.isValid) {
          toast({
            title: "Erreur de validation",
            description: validation.error,
            variant: "destructive"
          });
          return;
        }
      }
      
      if (key.includes('phone') && value) {
        const validation = InputValidator.validatePhone(value);
        if (!validation.isValid) {
          toast({
            title: "Erreur de validation",
            description: validation.error,
            variant: "destructive"
          });
          return;
        }
      }
      
      if ((key.includes('name') || key.includes('first_name') || key.includes('last_name')) && value) {
        const validation = InputValidator.validateName(value);
        if (!validation.isValid) {
          toast({
            title: "Erreur de validation",
            description: validation.error,
            variant: "destructive"
          });
          return;
        }
      }
    }

    try {
      await onSubmit(sanitizedData);
    } catch (error) {
      SecurityMonitor.logSuspiciousActivity('form_submission_error', {
        formKey: rateLimitKey,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la soumission du formulaire.",
        variant: "destructive"
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {children}
    </form>
  );
};