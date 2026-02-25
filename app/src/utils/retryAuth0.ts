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

function shouldRetry(
  attempt: number,
  maxAttempts: number,
  error: unknown,
  retryableStatusCodes: number[],
): boolean {
  const hasRetriesLeft = attempt < maxAttempts;
  const isRetryable = isRetryableError(error, retryableStatusCodes);
  return hasRetriesLeft && isRetryable;
}

function logRetryAttempt(operationName: string, attempt: number, maxAttempts: number): void {
  if (attempt > FIRST_ATTEMPT) {
    console.info(`[Retry] Attempting ${operationName} (attempt ${attempt}/${maxAttempts})`);
  }
}

function logRetrySuccess(operationName: string, attempt: number): void {
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
}

function logAndTrackFailure(
  operationName: string,
  attempt: number,
  error: unknown,
  isRetryable: boolean,
): void {
  if (!isRetryable) {
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
}

async function executeRetryDelay(
  operationName: string,
  attempt: number,
  initialDelayMs: number,
  maxDelayMs: number,
  backoffMultiplier: number,
  error: unknown,
): Promise<void> {
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

export async function retryAuth0Operation<T>(
  fn: () => Promise<T>,
  operationName: string,
  config?: RetryConfig,
): Promise<T> {
  const { maxRetries, initialDelayMs, maxDelayMs, backoffMultiplier, retryableStatusCodes } = {
    ...DEFAULT_RETRY_CONFIG,
    ...config,
  };

  let attempt = FIRST_ATTEMPT;
  const maxAttempts = maxRetries + FIRST_ATTEMPT;

  while (attempt <= maxAttempts) {
    try {
      logRetryAttempt(operationName, attempt, maxAttempts);

      const result = await fn();

      logRetrySuccess(operationName, attempt);

      return result;
    } catch (error) {
      const canRetry = shouldRetry(attempt, maxAttempts, error, retryableStatusCodes);

      if (!canRetry) {
        const isRetryable = isRetryableError(error, retryableStatusCodes);
        logAndTrackFailure(operationName, attempt, error, isRetryable);
        throw error;
      }

      await executeRetryDelay(
        operationName,
        attempt,
        initialDelayMs,
        maxDelayMs,
        backoffMultiplier,
        error,
      );

      attempt++;
    }
  }

  // This should never be reached due to the logic above, but TypeScript needs it
  throw new Error(`[Retry] ${operationName} exhausted all attempts without throwing`);
}
