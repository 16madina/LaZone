/**
 * Security utilities for input validation and sanitization
 */

import DOMPurify from 'dompurify';
import { logger } from './logger';

// Input validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]{10,15}$/,
  name: /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/,
  text: /^[\w\s\-'.,!?À-ÿ]{0,500}$/,
  url: /^https?:\/\/.+/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
} as const;

// Input sanitization
export class InputSanitizer {
  /**
   * Sanitize HTML content to prevent XSS attacks
   */
  static sanitizeHtml(input: string): string {
    if (typeof input !== 'string') return '';
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u'],
      ALLOWED_ATTR: []
    });
  }

  /**
   * Sanitize plain text input
   */
  static sanitizeText(input: string, maxLength: number = 500): string {
    if (typeof input !== 'string') return '';
    return input
      .trim()
      .slice(0, maxLength)
      .replace(/[<>]/g, ''); // Remove potential HTML tags
  }

  /**
   * Sanitize email input
   */
  static sanitizeEmail(email: string): string {
    if (typeof email !== 'string') return '';
    return email.toLowerCase().trim();
  }

  /**
   * Sanitize phone number input
   */
  static sanitizePhone(phone: string): string {
    if (typeof phone !== 'string') return '';
    return phone.replace(/[^\d\+\-\s\(\)]/g, '').trim();
  }
}

// Input validation
export class InputValidator {
  /**
   * Validate email format
   */
  static validateEmail(email: string): { isValid: boolean; error?: string } {
    const sanitized = InputSanitizer.sanitizeEmail(email);
    
    if (!sanitized) {
      return { isValid: false, error: 'Email is required' };
    }
    
    if (!VALIDATION_PATTERNS.email.test(sanitized)) {
      return { isValid: false, error: 'Invalid email format' };
    }
    
    return { isValid: true };
  }

  /**
   * Validate phone number format
   */
  static validatePhone(phone: string): { isValid: boolean; error?: string } {
    const sanitized = InputSanitizer.sanitizePhone(phone);
    
    if (!sanitized) {
      return { isValid: false, error: 'Phone number is required' };
    }
    
    if (!VALIDATION_PATTERNS.phone.test(sanitized)) {
      return { isValid: false, error: 'Invalid phone number format' };
    }
    
    return { isValid: true };
  }

  /**
   * Validate name format
   */
  static validateName(name: string): { isValid: boolean; error?: string } {
    const sanitized = InputSanitizer.sanitizeText(name, 50);
    
    if (!sanitized) {
      return { isValid: false, error: 'Name is required' };
    }
    
    if (!VALIDATION_PATTERNS.name.test(sanitized)) {
      return { isValid: false, error: 'Invalid name format' };
    }
    
    return { isValid: true };
  }

  /**
   * Validate UUID format
   */
  static validateUuid(uuid: string): { isValid: boolean; error?: string } {
    if (typeof uuid !== 'string') {
      return { isValid: false, error: 'Invalid UUID format' };
    }
    
    if (!VALIDATION_PATTERNS.uuid.test(uuid)) {
      return { isValid: false, error: 'Invalid UUID format' };
    }
    
    return { isValid: true };
  }
}

// Rate limiting utility
export class RateLimiter {
  private static attempts = new Map<string, { count: number; firstAttempt: number }>();
  private static readonly MAX_ATTEMPTS = 5;
  private static readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes

  /**
   * Check if an action is rate limited
   */
  static isRateLimited(key: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(key);

    if (!attempt) {
      this.attempts.set(key, { count: 1, firstAttempt: now });
      return false;
    }

    // Reset if window has passed
    if (now - attempt.firstAttempt > this.WINDOW_MS) {
      this.attempts.set(key, { count: 1, firstAttempt: now });
      return false;
    }

    // Increment attempt count
    attempt.count++;

    // Log suspicious activity
    if (attempt.count > this.MAX_ATTEMPTS) {
      logger.warn('Rate limit exceeded', {
        key,
        attempts: attempt.count,
        component: 'RateLimiter'
      });
      return true;
    }

    return false;
  }

  /**
   * Reset rate limit for a key
   */
  static reset(key: string): void {
    this.attempts.delete(key);
  }
}

// Security monitoring
export class SecurityMonitor {
  /**
   * Log suspicious activity
   */
  static logSuspiciousActivity(
    activityType: string,
    details: Record<string, any>
  ): void {
    logger.warn('Suspicious activity detected', {
      activityType,
      details,
      timestamp: new Date().toISOString(),
      component: 'SecurityMonitor'
    });

    // In production, this would send to a security monitoring service
    if (import.meta.env.PROD) {
      // TODO: Integrate with security monitoring service like Sentry
    }
  }

  /**
   * Log authentication events
   */
  static logAuthEvent(
    event: 'login_success' | 'login_failure' | 'signup' | 'logout',
    userId?: string,
    metadata?: Record<string, any>
  ): void {
    logger.info(`Auth event: ${event}`, {
      event,
      userId,
      metadata,
      timestamp: new Date().toISOString(),
      component: 'SecurityMonitor'
    });
  }
}

// Content Security Policy helpers
export const CSP_DIRECTIVES = {
  'default-src': "'self'",
  'script-src': "'self' 'unsafe-inline'", // Note: unsafe-inline needed for Vite in dev
  'style-src': "'self' 'unsafe-inline'",
  'img-src': "'self' data: https: https://*.mapbox.com",
  'font-src': "'self'",
  'connect-src': "'self' https://szmuqzatdynferpqulmx.supabase.co wss://szmuqzatdynferpqulmx.supabase.co https://api.mapbox.com https://*.tiles.mapbox.com https://events.mapbox.com https://nominatim.openstreetmap.org",
  'media-src': "'self'",
  'object-src': "'none'",
  'frame-src': "'none'",
  'worker-src': "'self' blob: https://*.mapbox.com https://api.mapbox.com",
  'child-src': "'self' blob:",
  'form-action': "'self'",
  'upgrade-insecure-requests': '',
  'block-all-mixed-content': '',
};