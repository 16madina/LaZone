import React, { createContext, useContext, useEffect } from 'react';
import { SecurityMonitor, CSP_DIRECTIVES } from '@/utils/security';
import { logger } from '@/utils/logger';

interface SecurityContextType {
  reportSecurity: (event: string, details: Record<string, any>) => void;
}

const SecurityContext = createContext<SecurityContextType | null>(null);

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within SecurityProvider');
  }
  return context;
};

interface SecurityProviderProps {
  children: React.ReactNode;
}

/**
 * Security provider that sets up security monitoring and CSP
 */
export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  useEffect(() => {
    // Set up Content Security Policy
    const cspString = Object.entries(CSP_DIRECTIVES)
      .map(([directive, value]) => `${directive} ${value}`)
      .join('; ');
    
    // Create meta tag for CSP
    const meta = document.createElement('meta');
    meta.setAttribute('http-equiv', 'Content-Security-Policy');
    meta.setAttribute('content', cspString);
    
    // Only add if not already present
    if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
      document.head.appendChild(meta);
    }

    // Set up global error handling for security events
    const handleGlobalError = (event: ErrorEvent) => {
      SecurityMonitor.logSuspiciousActivity('global_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        userAgent: navigator.userAgent
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      SecurityMonitor.logSuspiciousActivity('unhandled_promise_rejection', {
        reason: event.reason?.toString() || 'Unknown error',
        userAgent: navigator.userAgent
      });
    };

    // Monitor for potential XSS attempts
    const handleSecurityViolation = (event: SecurityPolicyViolationEvent) => {
      SecurityMonitor.logSuspiciousActivity('csp_violation', {
        violatedDirective: event.violatedDirective,
        blockedURI: event.blockedURI,
        documentURI: event.documentURI,
        effectiveDirective: event.effectiveDirective
      });
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('securitypolicyviolation', handleSecurityViolation);

    // Log security provider initialization
    logger.info('Security Provider initialized', {
      csp: cspString,
      userAgent: navigator.userAgent,
      component: 'SecurityProvider'
    });

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('securitypolicyviolation', handleSecurityViolation);
    };
  }, []);

  const reportSecurity = (event: string, details: Record<string, any>) => {
    SecurityMonitor.logSuspiciousActivity(event, details);
  };

  return (
    <SecurityContext.Provider value={{ reportSecurity }}>
      {children}
    </SecurityContext.Provider>
  );
};