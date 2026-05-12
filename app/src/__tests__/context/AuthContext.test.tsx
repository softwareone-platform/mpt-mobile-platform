import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import React from 'react';

jest.mock('@/services/authService');
jest.mock('@/services/credentialStorageService');
jest.mock('@/services/loggerService', () => ({
  logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn() },
}));
jest.mock('@/hooks/queries/usePortalVersion', () => ({
  usePortalVersion: jest.fn(() => ({ data: undefined })),
}));
jest.mock('@/lib/tokenProvider', () => ({
  tokenProvider: { register: jest.fn(() => jest.fn()) },
}));
jest.mock('@/hooks/useTrackEvent', () => ({ trackEvent: jest.fn() }));
jest.mock('@/services/environmentSwitcherService', () => ({
  environmentSwitcherService: { switchEnvironmentForEmail: jest.fn() },
}));
jest.mock('@/services/appInsightsService', () => ({
  appInsightsService: { trackException: jest.fn(), clearUser: jest.fn() },
}));
jest.mock('@/utils/moduleClaims', () => ({
  getModuleClaims: jest.fn(() => null),
  getAccountType: jest.fn(() => null),
}));

import { ACCOUNT_ID_CLAIM_KEY } from '@/constants/auth';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { appInsightsService } from '@/services/appInsightsService';
import authService from '@/services/authService';
import credentialStorageService from '@/services/credentialStorageService';
import { logger } from '@/services/loggerService';

const mockAuthService = authService as jest.Mocked<typeof authService>;
const mockCredentialStorage = credentialStorageService as jest.Mocked<
  typeof credentialStorageService
>;
const mockAppInsights = appInsightsService as jest.Mocked<typeof appInsightsService>;

const makeTokens = () => ({
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  expiresAt: Math.floor(Date.now() / 1000) + 3600,
  tokenType: 'Bearer',
});

const makeUser = (accountId?: string) => ({
  sub: 'user-1',
  ...(accountId !== undefined && { [ACCOUNT_ID_CLAIM_KEY]: accountId }),
});

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
  return { wrapper, queryClient };
};

const setupLoadStoredAuth = (storedAccountId: string | null, tokenAccountId?: string) => {
  mockCredentialStorage.loadStoredCredentials.mockResolvedValue({
    refreshToken: 'rt',
    user: { sub: 'user-1' },
    metadata: null,
  });
  mockCredentialStorage.loadAccountId.mockResolvedValue(storedAccountId);
  mockAuthService.refreshAccessToken.mockResolvedValue(makeTokens());
  mockAuthService.getUserFromToken.mockReturnValue(makeUser(tokenAccountId));
};

describe('AuthContext - syncStoredAccountIdFromToken', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCredentialStorage.storeTokens.mockResolvedValue();
    mockCredentialStorage.storeAccountId.mockResolvedValue();
    mockCredentialStorage.clearAccountId.mockResolvedValue();
    mockAuthService.isTokenExpired.mockReturnValue(false);
  });

  it('updates stored accountId when token carries a different one', async () => {
    setupLoadStoredAuth('old-account', 'new-account');
    const { wrapper } = createWrapper();

    renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(mockCredentialStorage.storeAccountId).toHaveBeenCalledWith('new-account');
    });
    expect(mockCredentialStorage.clearAccountId).not.toHaveBeenCalled();
  });

  it('clears stored accountId when token carries no accountId claim', async () => {
    setupLoadStoredAuth('stale-account', undefined);
    const { wrapper } = createWrapper();

    renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(mockCredentialStorage.clearAccountId).toHaveBeenCalled();
    });
    expect(mockCredentialStorage.storeAccountId).not.toHaveBeenCalled();
  });

  it('does not modify accountId storage when token matches stored', async () => {
    setupLoadStoredAuth('same-account', 'same-account');
    const { wrapper } = createWrapper();

    renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(mockCredentialStorage.storeTokens).toHaveBeenCalled();
    });
    expect(mockCredentialStorage.storeAccountId).not.toHaveBeenCalled();
    expect(mockCredentialStorage.clearAccountId).not.toHaveBeenCalled();
  });

  it('logs a warning when token accountId differs from stored', async () => {
    setupLoadStoredAuth('old-account', 'new-account');
    const { wrapper } = createWrapper();

    renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(logger.warn).toHaveBeenCalledWith('Token accountId does not match stored accountId', {
        operation: 'syncStoredAccountIdFromToken',
      });
    });
  });
});

describe('AuthContext - logout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCredentialStorage.storeTokens.mockResolvedValue();
    mockCredentialStorage.storeAccountId.mockResolvedValue();
    mockCredentialStorage.clearAccountId.mockResolvedValue();
    mockCredentialStorage.clearAllCredentials.mockResolvedValue();
    mockAuthService.isTokenExpired.mockReturnValue(false);
    mockAuthService.logout.mockResolvedValue();
    setupLoadStoredAuth('acc-1', 'acc-1');
  });

  it('clears the React Query cache on logout', async () => {
    const { wrapper, queryClient } = createWrapper();
    const clearSpy = jest.spyOn(queryClient, 'clear');

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.status).toBe('authenticated'));

    await act(async () => {
      await result.current.logout();
    });

    expect(clearSpy).toHaveBeenCalledTimes(1);
  });

  it('clears the App Insights user context on logout', async () => {
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.status).toBe('authenticated'));

    await act(async () => {
      await result.current.logout();
    });

    expect(mockAppInsights.clearUser).toHaveBeenCalledTimes(1);
  });

  it('still clears cache and user context when logout API call fails', async () => {
    mockAuthService.logout.mockRejectedValue(new Error('network error'));
    const { wrapper, queryClient } = createWrapper();
    const clearSpy = jest.spyOn(queryClient, 'clear');

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.status).toBe('authenticated'));

    await act(async () => {
      await result.current.logout();
    });

    expect(clearSpy).toHaveBeenCalledTimes(1);
    expect(mockAppInsights.clearUser).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe('unauthenticated');
  });
});
