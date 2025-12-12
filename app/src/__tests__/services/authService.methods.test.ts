// Create module-scoped mock functions
let mockPasswordlessWithEmail: jest.Mock;
let mockLoginWithEmail: jest.Mock;
let mockRefreshToken: jest.Mock;
let mockRevoke: jest.Mock;
let mockClearCredentials: jest.Mock;

jest.mock('react-native-auth0', () => {
  const passwordlessWithEmail = jest.fn();
  const loginWithEmail = jest.fn();
  const refreshToken = jest.fn();
  const revoke = jest.fn();
  const clearCredentials = jest.fn();
  
  // @ts-ignore
  mockPasswordlessWithEmail = passwordlessWithEmail;
  // @ts-ignore
  mockLoginWithEmail = loginWithEmail;
  // @ts-ignore
  mockRefreshToken = refreshToken;
  // @ts-ignore
  mockRevoke = revoke;
  // @ts-ignore
  mockClearCredentials = clearCredentials;
  
  return jest.fn().mockImplementation(() => ({
    auth: { passwordlessWithEmail, loginWithEmail, refreshToken, revoke },
    credentialsManager: { clearCredentials },
  }));
});

jest.mock('jwt-decode');
jest.mock('../../config/env.config', () => ({
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

import { jwtDecode } from 'jwt-decode';
import { authService } from '@/services/authService';

const mockJwtDecode = jwtDecode as jest.MockedFunction<typeof jwtDecode>;

describe('AuthService - Auth0 Methods', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
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
      mockJwtDecode.mockImplementation(() => { throw new Error('Invalid'); });

      const result = await authService.verifyPasswordlessOtp('test@example.com', '123456');

      expect(result.expiresAt).toBeUndefined();
      expect(result.tokenType).toBe('Bearer');
    });

    it('should handle errors', async () => {
      mockLoginWithEmail.mockRejectedValue('error');
      await expect(authService.verifyPasswordlessOtp('test@example.com', '123456')).rejects.toThrow();
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh token successfully', async () => {
      mockRefreshToken.mockResolvedValue({
        accessToken: 'new-token',
        refreshToken: 'new-refresh',
        tokenType: 'Bearer',
      });
      mockJwtDecode.mockReturnValue({ exp: 9876543210 });

      const result = await authService.refreshAccessToken('old-refresh');

      expect(result.accessToken).toBe('new-token');
      expect(result.expiresAt).toBe(9876543210);
    });

    it('should reuse old refresh token if new one not provided', async () => {
      mockRefreshToken.mockResolvedValue({ accessToken: 'new-token' });
      mockJwtDecode.mockReturnValue({ exp: 123 });

      const result = await authService.refreshAccessToken('old-refresh');

      expect(result.refreshToken).toBe('old-refresh');
      expect(result.tokenType).toBe('Bearer');
    });

    it('should handle errors', async () => {
      mockRefreshToken.mockRejectedValue('error');
      await expect(authService.refreshAccessToken('token')).rejects.toThrow();
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
});
