import { renderHook, waitFor } from '@testing-library/react-native';
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
  appInsightsService: { trackException: jest.fn() },
}));
jest.mock('@/utils/moduleClaims', () => ({
  getModuleClaims: jest.fn(() => null),
  getAccountType: jest.fn(() => null),
}));

import { ACCOUNT_ID_CLAIM_KEY } from '@/constants/auth';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import authService from '@/services/authService';
import credentialStorageService from '@/services/credentialStorageService';
import { logger } from '@/services/loggerService';

const mockAuthService = authService as jest.Mocked<typeof authService>;
const mockCredentialStorage = credentialStorageService as jest.Mocked<
  typeof credentialStorageService
>;

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

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

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

    renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(mockCredentialStorage.storeAccountId).toHaveBeenCalledWith('new-account');
    });
    expect(mockCredentialStorage.clearAccountId).not.toHaveBeenCalled();
  });

  it('clears stored accountId when token carries no accountId claim', async () => {
    setupLoadStoredAuth('stale-account', undefined);

    renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(mockCredentialStorage.clearAccountId).toHaveBeenCalled();
    });
    expect(mockCredentialStorage.storeAccountId).not.toHaveBeenCalled();
  });

  it('does not modify accountId storage when token matches stored', async () => {
    setupLoadStoredAuth('same-account', 'same-account');

    renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(mockCredentialStorage.storeTokens).toHaveBeenCalled();
    });
    expect(mockCredentialStorage.storeAccountId).not.toHaveBeenCalled();
    expect(mockCredentialStorage.clearAccountId).not.toHaveBeenCalled();
  });

  it('logs a warning when token accountId differs from stored', async () => {
    setupLoadStoredAuth('old-account', 'new-account');

    renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(logger.warn).toHaveBeenCalledWith(
        'Token accountId does not match stored accountId',
        { operation: 'syncStoredAccountIdFromToken' },
      );
    });
  });
});
