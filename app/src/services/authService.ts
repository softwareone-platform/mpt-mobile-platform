import config from '@/config/environment';
import Auth0 from 'react-native-auth0';
import { jwtDecode } from 'jwt-decode';

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
        this.domain = config.AUTH0_DOMAIN;
        this.clientId = config.AUTH0_CLIENT_ID;
        this.audience = config.AUTH0_AUDIENCE;

        this.auth0 = new Auth0({
            domain: this.domain,
            clientId: this.clientId,
        });
    }

    private getExpiryFromJWT(accessToken: string): number | undefined {
        try {
            const decoded = jwtDecode<JWTPayload>(accessToken);
            return decoded.exp;
        } catch (error) {
            console.error('Failed to decode JWT:', error);
            return undefined;
        }
    }

    async sendPasswordlessEmail(email: string): Promise<Auth0PasswordlessResponse> {
        try {
            await this.auth0.auth.passwordlessWithEmail({
                email,
                send: 'code',
                authParams: {
                    scope: config.AUTH0_SCOPE,
                    ...(this.audience && { audience: this.audience }),
                },
            });

            return { success: true };
        } catch (error) {
            throw new Error(
                error instanceof Error
                    ? error.message
                    : 'Failed to send authentication email'
            );
        }
    }

    async verifyPasswordlessOtp(email: string, otp: string): Promise<AuthTokens> {
        try {
            const result = await this.auth0.auth.loginWithEmail({
                email,
                code: otp,
                audience: this.audience,
                scope: config.AUTH0_SCOPE,
            });

            let expiresAt: number | undefined;
            if (result.expiresIn) {
                expiresAt = Math.floor(Date.now() / 1000) + result.expiresIn;
            } else {
                expiresAt = this.getExpiryFromJWT(result.accessToken);
            }

            return {
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
                tokenType: result.tokenType || 'Bearer',
                expiresAt,
            };
        } catch (error) {
            throw new Error(
                error instanceof Error
                    ? error.message
                    : 'Failed to verify authentication code'
            );
        }
    }

    async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
        try {
            const result = await this.auth0.auth.refreshToken({ refreshToken });

            let expiresAt: number | undefined;
            if (result.expiresIn) {
                expiresAt = Math.floor(Date.now() / 1000) + result.expiresIn;
            } else {
                expiresAt = this.getExpiryFromJWT(result.accessToken);
            }

            return {
                accessToken: result.accessToken,
                refreshToken: result.refreshToken || refreshToken,
                tokenType: result.tokenType || 'Bearer',
                expiresAt,
            };
        } catch (error) {
            throw new Error('Failed to refresh authentication');
        }
    }

    async getUserProfile(accessToken: string): Promise<User> {
        try {
            const userData = await this.auth0.auth.userInfo({ token: accessToken });

            return userData;
        } catch (error) {
            throw new Error('Failed to get user profile');
        }
    }

    async logout(accessToken?: string): Promise<boolean> {
        let success = true;

        try {
            if (accessToken) {
                await fetch(`https://${this.domain}/oauth/revoke`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        client_id: this.clientId,
                        token: accessToken,
                    }),
                });
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