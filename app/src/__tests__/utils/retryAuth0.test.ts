import { retryAuth0Operation, ErrorWithStatus } from '@/utils/retryAuth0';

jest.mock('@/services/appInsightsService', () => ({
  appInsightsService: {
    trackEvent: jest.fn(),
  },
}));

describe('retryAuth0Operation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return result on first attempt if successful', async () => {
    const mockFn = jest.fn().mockResolvedValue('success');

    const result = await retryAuth0Operation(mockFn, 'testOperation');

    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should retry on retryable errors and succeed eventually', async () => {
    const serviceError: ErrorWithStatus = new Error('Service Unavailable');
    serviceError.status = 503;

    const mockFn = jest
      .fn()
      .mockRejectedValueOnce(serviceError)
      .mockRejectedValueOnce(serviceError)
      .mockResolvedValue('success');

    const result = await retryAuth0Operation(mockFn, 'testOperation', {
      maxRetries: 3,
      initialDelayMs: 10,
    });

    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it('should not retry on non-retryable errors', async () => {
    const authError: ErrorWithStatus = new Error('invalid_grant');
    authError.name = 'invalid_grant';

    const mockFn = jest.fn().mockRejectedValue(authError);

    await expect(
      retryAuth0Operation(mockFn, 'testOperation', {
        maxRetries: 3,
        initialDelayMs: 10,
      }),
    ).rejects.toThrow('invalid_grant');

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should throw after max retries exceeded', async () => {
    const networkError: ErrorWithStatus = new Error('network');

    const mockFn = jest.fn().mockRejectedValue(networkError);

    await expect(
      retryAuth0Operation(mockFn, 'testOperation', {
        maxRetries: 2,
        initialDelayMs: 10,
      }),
    ).rejects.toThrow('network');

    expect(mockFn).toHaveBeenCalledTimes(3); // Initial + 2 retries
  });
});
