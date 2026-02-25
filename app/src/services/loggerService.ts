import { appInsightsService } from './appInsightsService';
import type { SeverityLevel } from './appInsightsService';

import { configService } from '@/config/env.config';
import { DEFAULT_ENVIRONMENT, LOG_LEVELS_BY_ENVIRONMENT } from '@/constants/logger';
import type { AppEnvironment, LogContext, LogLevel } from '@/types/logger';

class LoggerService {
  private environment: AppEnvironment;
  private enabledLevels: LogLevel[];

  constructor() {
    this.environment = this.getEnvironment();
    this.enabledLevels = LOG_LEVELS_BY_ENVIRONMENT[this.environment];
  }

  private getEnvironment(): AppEnvironment {
    const env = configService.get('APP_ENV')?.toLowerCase();

    if (env === 'prod') {
      return 'prod';
    }

    if (env === 'qa') {
      return 'qa';
    }

    return DEFAULT_ENVIRONMENT;
  }

  private isLevelEnabled(level: LogLevel): boolean {
    return this.enabledLevels.includes(level);
  }

  private formatMessage(message: string, context?: LogContext): string {
    const parts: string[] = [];

    if (context?.category) {
      parts.push(`[${context.category.toUpperCase()}]`);
    }

    if (context?.component) {
      parts.push(`[${context.component}]`);
    }

    if (context?.screen) {
      parts.push(`[${context.screen}]`);
    }

    parts.push(message);

    return parts.join(' ');
  }

  private getAppInsightsSeverity(level: LogLevel): SeverityLevel {
    const severityMap: Record<LogLevel, SeverityLevel> = {
      debug: 'Verbose',
      info: 'Information',
      warn: 'Warning',
      error: 'Error',
    };

    return severityMap[level];
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    if (!this.isLevelEnabled(level)) {
      return;
    }

    const formattedMessage = this.formatMessage(message, context);
    const logContext = context ? { ...context } : undefined;

    // Remove formatting fields from AppInsights context
    if (logContext) {
      delete logContext.category;
      delete logContext.component;
      delete logContext.screen;
    }

    switch (level) {
      case 'debug':
      case 'info':
        console.info(formattedMessage, logContext || '');
        break;
      case 'warn':
        console.warn(formattedMessage, logContext || '');
        break;
      case 'error':
        console.error(formattedMessage, logContext || '');
        break;
    }

    if (appInsightsService.isReady() && (level === 'warn' || level === 'error')) {
      const severity = this.getAppInsightsSeverity(level);
      appInsightsService.trackTrace(formattedMessage, severity, logContext);
    }
  }

  public debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  public info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  public warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  public error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorMessage = error instanceof Error ? `${message}: ${error.message}` : message;
    const errorContext: LogContext = {
      ...context,
      errorStack: error instanceof Error ? error.stack : undefined,
      errorName: error instanceof Error ? error.name : undefined,
    };

    this.log('error', errorMessage, errorContext);

    // Track exception in AppInsights
    if (appInsightsService.isReady() && error instanceof Error) {
      appInsightsService.trackException(error, errorContext, 'Error');
    }
  }

  /**
   * Log critical business events (all environments, bypasses filtering)
   * Use for important events that must be tracked in production:
   * - Account switching
   * - Login/logout events
   * - Critical state changes
   * - Important user actions
   *
   * Always logs to console and AppInsights regardless of environment.
   */
  public trace(message: string, context?: LogContext): void {
    const formattedMessage = this.formatMessage(message, context);
    const logContext = context ? { ...context } : undefined;

    // Remove formatting fields from AppInsights context
    if (logContext) {
      delete logContext.category;
      delete logContext.component;
      delete logContext.screen;
    }

    console.info(formattedMessage, logContext || {});

    if (appInsightsService.isReady()) {
      appInsightsService.trackTrace(formattedMessage, 'Information', logContext);
    }
  }

  public getConfig() {
    return {
      environment: this.environment,
      enabledLevels: [...this.enabledLevels],
    };
  }

  public isEnabled(level: LogLevel): boolean {
    return this.isLevelEnabled(level);
  }
}

export const logger = new LoggerService();
export { LoggerService };
