import { appInsightsService } from '@/services/appInsightsService';

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_INITIAL_DELAY_MS = 1000;
const DEFAULT_MAX_DELAY_MS = 10000;
const DEFAULT_BACKOFF_MULTIPLIER = 2;
const DEFAULT_RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

const FIRST_ATTEMPT = 1;

export interface RetryConfig {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  retryableStatusCodes?: number[];
}

export interface ErrorWithStatus extends Error {
  status?: number;
  statusCode?: number;
  code?: string;
}

const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: DEFAULT_MAX_RETRIES,
  initialDelayMs: DEFAULT_INITIAL_DELAY_MS,
  maxDelayMs: DEFAULT_MAX_DELAY_MS,
  backoffMultiplier: DEFAULT_BACKOFF_MULTIPLIER,
  retryableStatusCodes: DEFAULT_RETRYABLE_STATUS_CODES,
};

function isRetryableError(error: unknown, retryableStatusCodes: number[]): boolean {
  if (!error) return false;

  const err = error as ErrorWithStatus;

  const statusCode = err.status || err.statusCode;
  if (statusCode && retryableStatusCodes.includes(statusCode)) {
    return true;
  }

  const errorText = [err.message, err.name, err.code].join(' ').toLowerCase();
  const patterns = ['network', 'timeout', 'connection', 'service', 'not found'];

  return patterns.some((pattern) => errorText.includes(pattern));
}

function calculateDelay(
  attemptNumber: number,
  initialDelayMs: number,
  maxDelayMs: number,
  backoffMultiplier: number,
): number {
  const exponentialDelay =
    initialDelayMs * Math.pow(backoffMultiplier, attemptNumber - FIRST_ATTEMPT);
  return Math.min(exponentialDelay, maxDelayMs);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function retryAuth0Operation<T>(
  fn: () => Promise<T>,
  operationName: string,
  config?: RetryConfig,
): Promise<T> {
  const { maxRetries, initialDelayMs, maxDelayMs, backoffMultiplier, retryableStatusCodes } = {
    ...DEFAULT_RETRY_CONFIG,
    ...config,
  };

  let lastError: unknown;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      attempt++;

      if (attempt > FIRST_ATTEMPT) {
        console.info(`[Retry] Attempting ${operationName} (attempt ${attempt}/${maxRetries + 1})`);
      }

      const result = await fn();

      // Log successful retry if it wasn't the first attempt
      if (attempt > FIRST_ATTEMPT) {
        console.info(`[Retry] ${operationName} succeeded on attempt ${attempt}`);
        appInsightsService.trackEvent({
          name: 'Auth0RetrySuccess',
          properties: {
            operation: operationName,
            attempt: attempt.toString(),
            totalRetries: (attempt - FIRST_ATTEMPT).toString(),
          },
        });
      }

      return result;
    } catch (error) {
      lastError = error;

      // If this is the last attempt or error is not retryable, throw
      if (attempt > maxRetries || !isRetryableError(error, retryableStatusCodes)) {
        if (!isRetryableError(error, retryableStatusCodes)) {
          console.error(`[Retry] ${operationName} failed with non-retryable error`, error);
        } else {
          console.error(`[Retry] ${operationName} failed after ${attempt} attempts`, error);
          appInsightsService.trackEvent({
            name: 'Auth0RetryFailure',
            properties: {
              operation: operationName,
              totalAttempts: attempt.toString(),
              errorMessage: error instanceof Error ? error.message : 'Unknown error',
            },
          });
        }
        throw error;
      }

      // Calculate and apply backoff delay
      const delayMs = calculateDelay(attempt, initialDelayMs, maxDelayMs, backoffMultiplier);
      console.info(
        `[Retry] ${operationName} failed on attempt ${attempt}, retrying in ${delayMs}ms...`,
      );

      appInsightsService.trackEvent({
        name: 'Auth0RetryAttempt',
        properties: {
          operation: operationName,
          attempt: attempt.toString(),
          delayMs: delayMs.toString(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      await delay(delayMs);
    }
  }
  throw lastError;
}
