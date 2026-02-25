import type { AppEnvironment, LogLevel } from '@/types/logger';

export const LOG_LEVELS_BY_ENVIRONMENT: Record<AppEnvironment, LogLevel[]> = {
  prod: ['error'],
  qa: ['error', 'warn', 'info'],
  test: ['error', 'warn', 'info', 'debug'],
};

export const DEFAULT_ENVIRONMENT: AppEnvironment = 'test';

export const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};
