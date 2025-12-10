import { jwtDecode } from 'jwt-decode';

jest.mock('jwt-decode');
jest.mock('react-native-auth0');
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
});

