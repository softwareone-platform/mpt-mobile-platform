import Auth0 from 'react-native-auth0';
import { jwtDecode } from 'jwt-decode';
import { configService } from '@/config/env.config';

const AUTH0_DOMAIN = configService.get('AUTH0_DOMAIN');
const AUTH0_CLIENT_ID = configService.get('AUTH0_CLIENT_ID');
const AUTH0_AUDIENCE = configService.get('AUTH0_AUDIENCE');
const AUTH0_SCOPE = configService.get('AUTH0_SCOPE');

export interface AuthTokens {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: number;
    tokenType?: string;
}

export interface User {
    sub: string;
    email?: string;
    name?: string;
    picture?: string;
    email_verified?: boolean;
    [key: string]: any;
}

export interface Auth0PasswordlessResponse {
    success: boolean;
    message?: string;
}

export interface Auth0TokenResponse {
    access_token: string;
    refresh_token?: string;
    token_type: string;
    expires_in: number;
}

interface JWTPayload {
    exp?: number;
    iat?: number;
    sub?: string;
    [key: string]: any;
}

class AuthenticationService {
    private auth0: Auth0;
    private domain: string;
    private clientId: string;
    private audience?: string;

    constructor() {
        this.domain = AUTH0_DOMAIN;
        this.clientId = AUTH0_CLIENT_ID;
        this.audience = AUTH0_AUDIENCE;

        this.auth0 = new Auth0({
            domain: this.domain,
            clientId: this.clientId,
            useDPoP: false,
        });
    }

    private getExpiryFromJWT(accessToken: string): number | undefined {
        try {
            const decoded = jwtDecode<JWTPayload>(accessToken);
            return decoded.exp;
        } catch (error) {
            console.error('Failed to decode JWT:', error instanceof Error ? error.message : error);
            return undefined;
        }
    }

    async sendPasswordlessEmail(email: string): Promise<Auth0PasswordlessResponse> {
        try {
            await this.auth0.auth.passwordlessWithEmail({
                email,
                send: 'code',
                authParams: {
                    scope: AUTH0_SCOPE,
                    ...(this.audience && { audience: this.audience }),
                },
            });

            return { success: true };
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to send authentication email');
        }
    }

    async verifyPasswordlessOtp(email: string, otp: string): Promise<AuthTokens> {
        try {
            const result = await this.auth0.auth.loginWithEmail({
                email,
                code: otp,
                audience: this.audience,
                scope: AUTH0_SCOPE,
            });

            const expiresAt = this.getExpiryFromJWT(result.accessToken);

            return {
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
                tokenType: result.tokenType || 'Bearer',
                expiresAt,
            };
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to verify authentication code');
        }
    }

    async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
        try {
            const result = await this.auth0.auth.refreshToken({ refreshToken });
            const expiresAt = this.getExpiryFromJWT(result.accessToken);

            return {
                accessToken: result.accessToken,
                refreshToken: result.refreshToken || refreshToken,
                tokenType: result.tokenType || 'Bearer',
                expiresAt,
            };
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to refresh authentication');
        }
    }

    async getUserProfile(accessToken: string): Promise<User> {
        try {
            const userData = await this.auth0.auth.userInfo({ token: accessToken });

            return userData;
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to get user profile');
        }
    }

    async logout(refreshToken?: string): Promise<boolean> {
        let success = true;

        try {
            if (refreshToken) {
                await this.auth0.auth.revoke({ refreshToken });
            }
        } catch {
            success = false;
        }

        try {
            if (this.auth0.credentialsManager) {
                await this.auth0.credentialsManager.clearCredentials();
            }
        } catch {
            success = false;
        }

        return success;
    }

    isTokenExpired(expiresAt?: number): boolean {
        if (!expiresAt) return true;
        return Date.now() >= expiresAt * 1000;
    }

    async resendPasswordlessEmail(email: string): Promise<Auth0PasswordlessResponse> {
        return this.sendPasswordlessEmail(email);
    }
}

export const authService = new AuthenticationService();
export default authService;
