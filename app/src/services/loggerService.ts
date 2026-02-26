import { appInsightsService } from './appInsightsService';
import type { SeverityLevel } from './appInsightsService';

import { configService } from '@/config/env.config';
import { DEFAULT_LOG_LEVEL, LOG_LEVEL_PRIORITY } from '@/constants/logger';
import type { ConfigurableLogLevel, LogContext, LogLevel } from '@/types/logger';

class LoggerService {
  private enabledLevels: LogLevel[];
  private configuredLevel: ConfigurableLogLevel;

  constructor() {
    this.configuredLevel = this.getLogLevel();
    this.enabledLevels = this.calculateEnabledLevels(this.configuredLevel);
  }

  private getLogLevel(): ConfigurableLogLevel {
    const level = configService.get('LOG_LEVEL')?.toLowerCase();

    const validLevels: ConfigurableLogLevel[] = ['debug', 'info', 'warn', 'error'];
    if (level && validLevels.includes(level as ConfigurableLogLevel)) {
      return level as ConfigurableLogLevel;
    }

    return DEFAULT_LOG_LEVEL;
  }

  private calculateEnabledLevels(configuredLevel: ConfigurableLogLevel): LogLevel[] {
    const configuredPriority = LOG_LEVEL_PRIORITY[configuredLevel];
    const enabled: LogLevel[] = [];

    for (const [level, priority] of Object.entries(LOG_LEVEL_PRIORITY)) {
      if (priority >= configuredPriority) {
        enabled.push(level as LogLevel);
      }
    }

    return enabled;
  }

  private isLevelEnabled(level: LogLevel): boolean {
    // 'trace' is always enabled (wildcard for critical business events)
    if (level === 'trace') {
      return true;
    }
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
      trace: 'Information',
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
      case 'trace':
        console.info(formattedMessage, logContext || '');
        break;
      case 'warn':
        console.warn(formattedMessage, logContext || '');
        break;
      case 'error':
        console.error(formattedMessage, logContext || '');
        break;
    }

    // Send to AppInsights if level is enabled
    if (appInsightsService.isReady()) {
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
   * Trace critical business events (always logged regardless of LOG_LEVEL)
   * Use for: user login, account switch, critical user actions
   */
  public trace(message: string, context?: LogContext): void {
    this.log('trace', message, context);
  }

  public getConfig() {
    return {
      configuredLevel: this.configuredLevel,
      enabledLevels: [...this.enabledLevels],
    };
  }

  public isEnabled(level: LogLevel): boolean {
    return this.isLevelEnabled(level);
  }
}

export const logger = new LoggerService();
export { LoggerService };
