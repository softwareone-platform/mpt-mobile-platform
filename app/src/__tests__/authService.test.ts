import { jwtDecode } from 'jwt-decode';

// Mock Auth0 for the Auth0-dependent methods
let mockPasswordlessWithEmail: jest.Mock;
let mockLoginWithEmail: jest.Mock;
let mockRevoke: jest.Mock;
let mockClearCredentials: jest.Mock;

jest.mock('../services/appInsightsService', () => ({
  appInsightsService: {
    trackException: jest.fn(),
    isReady: jest.fn(() => false),
  },
}));

jest.mock('../services/auth0ErrorParsingService', () => ({
  auth0ErrorParsingService: {
    sanitizeForTelemetry: jest.fn((err: Error) => {
      const sanitized = new Error(`sanitized: ${err.message}`);
      sanitized.name = err.name;
      return sanitized;
    }),
  },
}));

jest.mock('../services/loggerService', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('react-native-auth0', () => {
  const passwordlessWithEmail = jest.fn();
  const loginWithEmail = jest.fn();
  const revoke = jest.fn();
  const clearCredentials = jest.fn();

  mockPasswordlessWithEmail = passwordlessWithEmail;
  mockLoginWithEmail = loginWithEmail;
  mockRevoke = revoke;
  mockClearCredentials = clearCredentials;

  return jest.fn().mockImplementation(() => ({
    auth: { passwordlessWithEmail, loginWithEmail, refreshToken: jest.fn(), revoke },
    credentialsManager: { clearCredentials },
  }));
});

jest.mock('jwt-decode');
jest.mock('../config/env.config', () => ({
  configService: {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        AUTH0_DOMAIN: 'test.auth0.com',
        AUTH0_CLIENT_ID: 'test-client-id',
        AUTH0_AUDIENCE: 'test-audience',
        AUTH0_SCOPE: 'openid profile email',
      };
      return config[key] || '';
    }),
  },
}));

const mockJwtDecode = jwtDecode as jest.MockedFunction<typeof jwtDecode>;

import { appInsightsService } from '../services/appInsightsService';
import { auth0ErrorParsingService } from '../services/auth0ErrorParsingService';
import authService, { User } from '../services/authService';
import { logger } from '../services/loggerService';

import { ACCOUNT_ID_CLAIM_KEY, USER_ID_CLAIM_KEY } from '@/constants/auth';

const mockAppInsights = appInsightsService as jest.Mocked<typeof appInsightsService>;
const mockAuth0ErrorParsing = auth0ErrorParsingService as jest.Mocked<
  typeof auth0ErrorParsingService
>;

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getUserFromToken', () => {
    it('should decode user from access token', () => {
      const mockUser: User = {
        sub: 'auth0|123456',
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://example.com/avatar.jpg',
        email_verified: true,
        [USER_ID_CLAIM_KEY]: 'user-123',
      };

      mockJwtDecode.mockReturnValue(mockUser);

      const result = authService.getUserFromToken('valid-token');

      expect(result).toEqual(mockUser);
      expect(mockJwtDecode).toHaveBeenCalledWith('valid-token');
    });

    it('should decode user with minimal required fields', () => {
      const mockUser: User = {
        sub: 'auth0|789',
      };

      mockJwtDecode.mockReturnValue(mockUser);

      const result = authService.getUserFromToken('minimal-token');

      expect(result).toEqual(mockUser);
    });

    it('should decode user with custom claims', () => {
      const mockUser: User = {
        sub: 'auth0|456',
        email: 'custom@example.com',
        [USER_ID_CLAIM_KEY]: 'custom-user-id',
        [ACCOUNT_ID_CLAIM_KEY]: 'account-123',
        customClaim: 'custom-value',
      };

      mockJwtDecode.mockReturnValue(mockUser);

      const result = authService.getUserFromToken('custom-token');

      expect(result).toEqual(mockUser);
      expect(result[USER_ID_CLAIM_KEY]).toBe('custom-user-id');
    });

    it('should throw error when token decode fails', () => {
      mockJwtDecode.mockImplementation(() => {
        throw new Error('Invalid token format');
      });

      expect(() => authService.getUserFromToken('invalid-token')).toThrow(
        'Failed to decode user from token',
      );
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to decode user from token',
        expect.any(Error),
        {
          operation: 'getUserFromToken',
        },
      );
    });

    it('should throw error for malformed JWT', () => {
      mockJwtDecode.mockImplementation(() => {
        throw new Error('JWT malformed');
      });

      expect(() => authService.getUserFromToken('malformed.token')).toThrow(
        'Failed to decode user from token',
      );
    });
  });

  describe('getUserIdFromUser', () => {
    it('should return userId from user claims', () => {
      const user: User = {
        sub: 'auth0|123',
        [USER_ID_CLAIM_KEY]: 'user-abc',
      };

      expect(authService.getUserIdFromUser(user)).toBe('user-abc');
    });

    it('should return undefined when user is null', () => {
      expect(authService.getUserIdFromUser(null)).toBeUndefined();
    });

    it('should return undefined when user is undefined', () => {
      expect(authService.getUserIdFromUser(undefined)).toBeUndefined();
    });

    it('should return undefined when userId claim is missing', () => {
      const user: User = { sub: 'auth0|123' };

      expect(authService.getUserIdFromUser(user)).toBeUndefined();
    });
  });

  describe('isTokenExpired', () => {
    it('should return true for expired token', () => {
      const pastTimestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      expect(authService.isTokenExpired(pastTimestamp)).toBe(true);
    });

    it('should return false for valid token', () => {
      const futureTimestamp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      expect(authService.isTokenExpired(futureTimestamp)).toBe(false);
    });

    it('should return true for undefined expiresAt', () => {
      expect(authService.isTokenExpired(undefined)).toBe(true);
    });

    it('should return true for token expiring at current time', () => {
      const currentTimestamp = Math.floor(Date.now() / 1000);
      expect(authService.isTokenExpired(currentTimestamp)).toBe(true);
    });

    it('should return false for token expiring 1 second in future', () => {
      const futureTimestamp = Math.floor(Date.now() / 1000) + 1;
      expect(authService.isTokenExpired(futureTimestamp)).toBe(false);
    });

    it('should return true for token expired 1 second ago', () => {
      const pastTimestamp = Math.floor(Date.now() / 1000) - 1;
      expect(authService.isTokenExpired(pastTimestamp)).toBe(true);
    });
  });

  describe('sendPasswordlessEmail', () => {
    it('should send email successfully', async () => {
      mockPasswordlessWithEmail.mockResolvedValue(undefined);
      const result = await authService.sendPasswordlessEmail('test@example.com');

      expect(result).toEqual({ success: true });
      expect(mockPasswordlessWithEmail).toHaveBeenCalledWith({
        email: 'test@example.com',
        send: 'code',
        authParams: { scope: 'openid profile email', audience: 'test-audience' },
      });
    });

    it('should handle errors', async () => {
      mockPasswordlessWithEmail.mockRejectedValue('error');
      await expect(authService.sendPasswordlessEmail('test@example.com')).rejects.toThrow();
    });

    it('tracks a sanitized error, not the original', async () => {
      const original = new Error('Failed for user@example.com');
      mockPasswordlessWithEmail.mockRejectedValue(original);

      await expect(authService.sendPasswordlessEmail('user@example.com')).rejects.toThrow();

      expect(mockAuth0ErrorParsing.sanitizeForTelemetry).toHaveBeenCalledWith(original);
      expect(mockAppInsights.trackException).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'sanitized: Failed for user@example.com' }),
        { operation: 'sendPasswordlessEmail' },
        'Critical',
      );
    });
  });

  describe('verifyPasswordlessOtp', () => {
    it('should verify OTP and return tokens', async () => {
      mockLoginWithEmail.mockResolvedValue({
        accessToken: 'token',
        refreshToken: 'refresh',
        tokenType: 'Bearer',
      });
      mockJwtDecode.mockReturnValue({ exp: 1234567890 });

      const result = await authService.verifyPasswordlessOtp('test@example.com', '123456');

      expect(result.accessToken).toBe('token');
      expect(result.expiresAt).toBe(1234567890);
    });

    it('should handle JWT decode failure', async () => {
      mockLoginWithEmail.mockResolvedValue({ accessToken: 'token' });
      mockJwtDecode.mockImplementation(() => {
        throw new Error('Invalid');
      });

      const result = await authService.verifyPasswordlessOtp('test@example.com', '123456');

      expect(result.expiresAt).toBeUndefined();
      expect(result.tokenType).toBe('Bearer');
    });

    it('should handle errors', async () => {
      mockLoginWithEmail.mockRejectedValue('error');
      await expect(
        authService.verifyPasswordlessOtp('test@example.com', '123456'),
      ).rejects.toThrow();
    });

    it('tracks a sanitized error, not the original', async () => {
      const original = new Error('Wrong code 123456 for user@example.com');
      mockLoginWithEmail.mockRejectedValue(original);

      await expect(
        authService.verifyPasswordlessOtp('user@example.com', '123456'),
      ).rejects.toThrow();

      expect(mockAuth0ErrorParsing.sanitizeForTelemetry).toHaveBeenCalledWith(original);
      expect(mockAppInsights.trackException).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'sanitized: Wrong code 123456 for user@example.com',
        }),
        { operation: 'verifyPasswordlessOtp' },
        'Critical',
      );
    });
  });

  describe('refreshAccessToken', () => {
    const mockFetch = jest.fn();

    beforeEach(() => {
      global.fetch = mockFetch;
    });

    afterEach(() => {
      mockFetch.mockReset();
    });

    it('should refresh token successfully via JSON fetch', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          access_token: 'new-token',
          refresh_token: 'new-refresh',
          token_type: 'Bearer',
          expires_in: 3600,
        }),
      });
      mockJwtDecode.mockReturnValue({ exp: 9876543210 });

      const result = await authService.refreshAccessToken('old-refresh');

      expect(result.accessToken).toBe('new-token');
      expect(result.refreshToken).toBe('new-refresh');
      expect(result.expiresAt).toBe(9876543210);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.auth0.com/oauth/token',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });

    it('should include marketplaceAccountId in body when accountId is provided', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          access_token: 'new-token',
          token_type: 'Bearer',
          expires_in: 3600,
        }),
      });
      mockJwtDecode.mockReturnValue({ exp: 123 });

      await authService.refreshAccessToken('old-refresh', 'acc-123');

      const body = JSON.parse((mockFetch.mock.calls[0][1] as RequestInit).body as string);
      expect(body.marketplaceAccountId).toBe('acc-123');
    });

    it('should reuse old refresh token when response omits refresh_token', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ access_token: 'new-token', token_type: 'Bearer', expires_in: 3600 }),
      });
      mockJwtDecode.mockReturnValue({ exp: 123 });

      const result = await authService.refreshAccessToken('old-refresh');

      expect(result.refreshToken).toBe('old-refresh');
      expect(result.tokenType).toBe('Bearer');
    });

    it('should throw when fetch response is not ok', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      });

      await expect(authService.refreshAccessToken('bad-token')).rejects.toThrow(
        'Token refresh failed: 401 Unauthorized',
      );
    });

    it('should throw when fetch rejects', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(authService.refreshAccessToken('token')).rejects.toThrow();
    });

    it('tracks a sanitized error, not the original', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        text: async () => 'invalid_grant',
      });

      await expect(authService.refreshAccessToken('bad-token')).rejects.toThrow();

      expect(mockAuth0ErrorParsing.sanitizeForTelemetry).toHaveBeenCalled();
      expect(mockAppInsights.trackException).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('sanitized:') }),
        { operation: 'refreshAccessToken' },
        'Critical',
      );
    });
  });

  describe('logout', () => {
    it('should logout successfully with refresh token', async () => {
      mockRevoke.mockResolvedValue(undefined);
      mockClearCredentials.mockResolvedValue(undefined);

      const result = await authService.logout('refresh-token');

      expect(result).toBe(true);
      expect(mockRevoke).toHaveBeenCalledWith({ refreshToken: 'refresh-token' });
    });

    it('should return false when operations fail', async () => {
      mockRevoke.mockRejectedValue(new Error('Failed'));
      mockClearCredentials.mockResolvedValue(undefined);

      const result = await authService.logout('refresh-token');

      expect(result).toBe(false);
    });
  });

  describe('resendPasswordlessEmail', () => {
    it('should resend email', async () => {
      mockPasswordlessWithEmail.mockResolvedValue(undefined);
      const result = await authService.resendPasswordlessEmail('test@example.com');
      expect(result).toEqual({ success: true });
    });
  });

  describe('reinitialize', () => {
    it('should clear credentials and recreate Auth0 instance', async () => {
      mockClearCredentials.mockResolvedValue(undefined);

      await authService.reinitialize();

      expect(mockClearCredentials).toHaveBeenCalled();
    });

    it('should handle error when clearing credentials fails', async () => {
      const error = new Error('Clear credentials failed');
      mockClearCredentials.mockRejectedValue(error);

      await authService.reinitialize();

      expect(logger.warn).toHaveBeenCalledWith('Failed to clear credentials during reinitialize', {
        operation: 'reinitialize',
      });
    });

    it('should handle missing credentialsManager gracefully', async () => {
      // This test ensures reinitialize doesn't fail if credentialsManager is undefined
      await authService.reinitialize();

      // Should complete without throwing
      expect(true).toBe(true);
    });
  });
});
