import type { ConfigurableLogLevel } from '@/types/logger';

export const DEFAULT_LOG_LEVEL: ConfigurableLogLevel = 'info';

export const LOG_LEVEL_PRIORITY: Record<ConfigurableLogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};
