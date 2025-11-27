import { tokenProvider, getAccessTokenAsync } from '@/lib/tokenProvider';

describe('tokenProvider', () => {
  beforeEach(() => {
    tokenProvider.register(() => Promise.resolve(null));
  });

  it('should return null if no token function registered', async () => {
    tokenProvider.register(() => Promise.resolve(null));

    const result = await getAccessTokenAsync();
    expect(result).toBeNull();
  });

  it('should return token from registered function', async () => {
    tokenProvider.register(() => Promise.resolve('mock-token'));

    const result = await getAccessTokenAsync();
    expect(result).toBe('mock-token');
  });

  it('should return null if registered function returns null', async () => {
    tokenProvider.register(() => Promise.resolve(null));

    const result = await getAccessTokenAsync();
    expect(result).toBeNull();
  });

  it('should call the registered function exactly once', async () => {
    const mockFn = jest.fn().mockResolvedValue('token');

    tokenProvider.register(mockFn);

    const result = await getAccessTokenAsync();

    expect(result).toBe('token');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});
