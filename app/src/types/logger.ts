export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'trace';
export type ConfigurableLogLevel = Exclude<LogLevel, 'trace'>;

export type LogCategory =
  | 'auth'
  | 'api'
  | 'navigation'
  | 'ui'
  | 'storage'
  | 'telemetry'
  | 'config'
  | 'general';

export type AppEnvironment = 'dev' | 'test' | 'qa' | 'prod';

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
