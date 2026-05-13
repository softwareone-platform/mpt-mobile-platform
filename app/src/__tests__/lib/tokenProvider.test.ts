import { tokenProvider, getAccessTokenAsync, forceRefreshTokenAsync } from '@/lib/tokenProvider';

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

describe('tokenProvider.registerRefresh / forceRefreshTokenAsync', () => {
  afterEach(() => {
    // unregister any refresh fn registered in tests
    const unregister = tokenProvider.registerRefresh(() => Promise.resolve(null));
    unregister();
  });

  it('returns null when no refresh function is registered', async () => {
    const unregister = tokenProvider.registerRefresh(() => Promise.resolve(null));
    unregister();

    const result = await forceRefreshTokenAsync();
    expect(result).toBeNull();
  });

  it('calls the registered refresh function and returns its token', async () => {
    const mockRefresh = jest.fn().mockResolvedValue('refreshed-token');
    tokenProvider.registerRefresh(mockRefresh);

    const result = await forceRefreshTokenAsync();

    expect(result).toBe('refreshed-token');
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it('returns null when the registered refresh function returns null', async () => {
    tokenProvider.registerRefresh(() => Promise.resolve(null));

    const result = await forceRefreshTokenAsync();
    expect(result).toBeNull();
  });

  it('unregisters the refresh function on cleanup', async () => {
    const mockRefresh = jest.fn().mockResolvedValue('token');
    const unregister = tokenProvider.registerRefresh(mockRefresh);

    unregister();

    const result = await forceRefreshTokenAsync();
    expect(result).toBeNull();
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it('replaces the previous refresh function when re-registered', async () => {
    const first = jest.fn().mockResolvedValue('first-token');
    const second = jest.fn().mockResolvedValue('second-token');

    tokenProvider.registerRefresh(first);
    tokenProvider.registerRefresh(second);

    const result = await forceRefreshTokenAsync();

    expect(result).toBe('second-token');
    expect(first).not.toHaveBeenCalled();
  });
});
