import type { AppEnvironment, LogLevel } from '@/types/logger';

export const LOG_LEVELS_BY_ENVIRONMENT: Record<AppEnvironment, LogLevel[]> = {
  dev: ['error', 'warn', 'info', 'debug', 'trace'],
  test: ['error', 'warn', 'info', 'debug', 'trace'],
  qa: ['error', 'warn', 'trace'],
  prod: ['error', 'trace'],
};

export const DEFAULT_ENVIRONMENT: AppEnvironment = 'test';

export const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  trace: 4,
};
