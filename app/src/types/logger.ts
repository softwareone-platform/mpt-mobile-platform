export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogCategory =
  | 'auth'
  | 'api'
  | 'navigation'
  | 'ui'
  | 'storage'
  | 'telemetry'
  | 'config'
  | 'general';

export type AppEnvironment = 'test' | 'qa' | 'prod';

export interface LogContext {
  category?: LogCategory;
  userId?: string;
  accountId?: string;
  component?: string;
  screen?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface LoggerConfig {
  environment: AppEnvironment;
  enabledLevels: LogLevel[];
  enableConsole: boolean;
  enableAppInsights: boolean;
}
