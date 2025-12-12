import { jwtDecode } from 'jwt-decode';

// Mock Auth0 for the Auth0-dependent methods
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
  
  mockPasswordlessWithEmail = passwordlessWithEmail;
  mockLoginWithEmail = loginWithEmail;
  mockRefreshToken = refreshToken;
  mockRevoke = revoke;
  mockClearCredentials = clearCredentials;
  
  return jest.fn().mockImplementation(() => ({
    auth: { passwordlessWithEmail, loginWithEmail, refreshToken, revoke },
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

import authService, { User } from '../services/authService';

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
                'https://claims.softwareone.com/userId': 'user-123',
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
                'https://claims.softwareone.com/userId': 'custom-user-id',
                'https://claims.softwareone.com/accountId': 'account-123',
                customClaim: 'custom-value',
            };

            mockJwtDecode.mockReturnValue(mockUser);

            const result = authService.getUserFromToken('custom-token');

            expect(result).toEqual(mockUser);
            expect(result['https://claims.softwareone.com/userId']).toBe('custom-user-id');
        });

        it('should throw error when token decode fails', () => {
            mockJwtDecode.mockImplementation(() => {
                throw new Error('Invalid token format');
            });

            expect(() => authService.getUserFromToken('invalid-token')).toThrow(
                'Failed to decode user from token'
            );
            expect(console.error).toHaveBeenCalledWith(
                'Failed to decode user from token:',
                'Invalid token format'
            );
        });

        it('should throw error for malformed JWT', () => {
            mockJwtDecode.mockImplementation(() => {
                throw new Error('JWT malformed');
            });

            expect(() => authService.getUserFromToken('malformed.token')).toThrow(
                'Failed to decode user from token'
            );
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


