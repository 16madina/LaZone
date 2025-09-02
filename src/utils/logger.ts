/**
 * Production-ready logging utility
 * Replaces console.log statements with proper logging levels
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  component?: string;
  userId?: string;
  action?: string;
  metadata?: Record<string, any>;
  [key: string]: any; // Allow additional properties
}

class Logger {
  private isDevelopment = import.meta.env.MODE === 'development';
  private logLevel: LogLevel = this.isDevelopment ? 'debug' : 'error';

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug') && this.isDevelopment) {
      console.log(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  error(message: string, error?: Error, context?: LogContext): void {
    if (this.shouldLog('error')) {
      const errorContext = {
        ...context,
        error: error?.message,
        stack: error?.stack
      };
      console.error(this.formatMessage('error', message, errorContext));
    }
  }

  // Production error tracking (would integrate with services like Sentry)
  trackError(error: Error, context?: LogContext): void {
    this.error('Tracked error', error, context);
    
    // In production, send to error tracking service
    if (!this.isDevelopment) {
      // Example: Sentry.captureException(error, { tags: context });
    }
  }
}

export const logger = new Logger();