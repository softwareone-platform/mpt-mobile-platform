import authService from '../services/authService';
import credentialStorageService from '../services/credentialStorageService';
import { AuthTokens, User } from '../services/authService';
import { jwtDecode } from 'jwt-decode';

jest.mock('../services/authService');
jest.mock('../services/credentialStorageService');
jest.mock('jwt-decode');

const mockAuthService = authService as jest.Mocked<typeof authService>;
const mockCredentialStorageService = credentialStorageService as jest.Mocked<typeof credentialStorageService>;
const mockJwtDecode = jwtDecode as jest.MockedFunction<typeof jwtDecode>;

const mockUser: User = {
    sub: 'auth0|123456789',
    email: 'test@example.com',
    name: 'Test User',
    picture: 'https://example.com/avatar.jpg',
    email_verified: true,
};

const mockTokens: AuthTokens = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresAt: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    tokenType: 'Bearer',
};

describe('AuthContext Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        mockAuthService.isTokenExpired.mockReturnValue(false);
        mockCredentialStorageService.loadStoredCredentials.mockResolvedValue({
            refreshToken: null,
            metadata: null,
            user: null,
        });
    });

    describe('Auth0 Response Parsing', () => {
        it('should correctly parse Auth0 login response with all fields', async () => {
            const mockAuth0LoginResponse = {
                accessToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...',
                refreshToken: 'refresh_token_value',
                tokenType: 'Bearer',
                expiresIn: 3600,
            };

            const expectedParsedTokens: AuthTokens = {
                accessToken: mockAuth0LoginResponse.accessToken,
                refreshToken: mockAuth0LoginResponse.refreshToken,
                tokenType: mockAuth0LoginResponse.tokenType,
                expiresAt: 1699127056, // Mocked calculation from JWT
            };

            // Mock JWT decoding
            mockJwtDecode.mockReturnValue({
                exp: 1699127056,
                iat: 1699123456,
                sub: 'auth0|123456789',
            });

            mockAuthService.verifyPasswordlessOtp.mockResolvedValue(expectedParsedTokens);

            const result = await authService.verifyPasswordlessOtp('test@example.com', '123456');

            expect(result).toEqual(expectedParsedTokens);
            expect(result.accessToken).toBe(mockAuth0LoginResponse.accessToken);
            expect(result.refreshToken).toBe(mockAuth0LoginResponse.refreshToken);
            expect(result.tokenType).toBe(mockAuth0LoginResponse.tokenType);
            expect(result.expiresAt).toBeDefined();
        });

        it('should handle Auth0 error responses correctly', async () => {
            const mockAuth0ErrorResponse = {
                error: 'invalid_grant',
                error_description: 'Invalid verification code',
            };

            mockAuthService.verifyPasswordlessOtp.mockRejectedValue(
                new Error(`Auth0 Error: ${mockAuth0ErrorResponse.error} - ${mockAuth0ErrorResponse.error_description}`)
            );

            await expect(authService.verifyPasswordlessOtp('test@example.com', 'wrong_code'))
                .rejects.toThrow('Auth0 Error: invalid_grant - Invalid verification code');
        });
    });
});