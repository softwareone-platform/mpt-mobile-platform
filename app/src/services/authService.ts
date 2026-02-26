import { jwtDecode } from 'jwt-decode';
import Auth0 from 'react-native-auth0';

import { configService } from '@/config/env.config';
import {
  AUTH0_REQUEST_TIMEOUT_MS,
  AUTH0_REFRESH_TOKEN_MAX_RETRIES,
  AUTH0_REFRESH_TOKEN_INITIAL_DELAY_MS,
} from '@/constants/api';
import { appInsightsService } from '@/services/appInsightsService';
import { logger } from '@/services/loggerService';
import { retryAuth0Operation } from '@/utils/retryAuth0';

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
  [key: string]: unknown;
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
  [key: string]: unknown;
}

class AuthenticationService {
  private auth0: Auth0;
  private domain: string = '';
  private clientId: string = '';
  private audience?: string = '';
  private scope: string = '';

  constructor() {
    this.auth0 = this.createAuth0Instance();
  }

  private createAuth0Instance(): Auth0 {
    this.domain = configService.get('AUTH0_DOMAIN');
    this.clientId = configService.get('AUTH0_CLIENT_ID');
    this.audience = configService.get('AUTH0_AUDIENCE');
    this.scope = configService.get('AUTH0_SCOPE');

    return new Auth0({
      domain: this.domain,
      clientId: this.clientId,
      useDPoP: false,
      timeout: AUTH0_REQUEST_TIMEOUT_MS,
    });
  }

  public async reinitialize(): Promise<void> {
    try {
      if (this.auth0.credentialsManager) {
        await this.auth0.credentialsManager.clearCredentials();
      }
    } catch (error) {
      logger.warn('Failed to clear credentials during reinitialize', {
        operation: 'reinitialize',
      });
    }

    this.auth0 = this.createAuth0Instance();
  }

  private getExpiryFromJWT(accessToken: string): number | undefined {
    try {
      const decoded = jwtDecode<JWTPayload>(accessToken);
      return decoded.exp;
    } catch (error) {
      logger.error('Failed to decode JWT', error, {
        operation: 'getExpiryFromJWT',
      });
      return undefined;
    }
  }

  async sendPasswordlessEmail(email: string): Promise<Auth0PasswordlessResponse> {
    try {
      await this.auth0.auth.passwordlessWithEmail({
        email,
        send: 'code',
        authParams: {
          scope: this.scope,
          ...(this.audience && { audience: this.audience }),
        },
      });

      return { success: true };
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to send authentication email');
      appInsightsService.trackException(err, { operation: 'sendPasswordlessEmail' }, 'Critical');
      throw err;
    }
  }

  async verifyPasswordlessOtp(email: string, otp: string): Promise<AuthTokens> {
    try {
      const result = await this.auth0.auth.loginWithEmail({
        email,
        code: otp,
        audience: this.audience,
        scope: this.scope,
      });

      const expiresAt = this.getExpiryFromJWT(result.accessToken);

      return {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        tokenType: result.tokenType || 'Bearer',
        expiresAt,
      };
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Failed to verify authentication code');
      appInsightsService.trackException(err, { operation: 'verifyPasswordlessOtp' }, 'Critical');
      throw err;
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const result = await retryAuth0Operation(
        async () => {
          return await this.auth0.auth.refreshToken({ refreshToken });
        },
        'refreshAccessToken',
        {
          maxRetries: AUTH0_REFRESH_TOKEN_MAX_RETRIES,
          initialDelayMs: AUTH0_REFRESH_TOKEN_INITIAL_DELAY_MS,
        },
      );
      const expiresAt = this.getExpiryFromJWT(result.accessToken);

      return {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken || refreshToken,
        tokenType: result.tokenType || 'Bearer',
        expiresAt,
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to refresh authentication');
      appInsightsService.trackException(err, { operation: 'refreshAccessToken' }, 'Critical');
      throw err;
    }
  }

  getUserFromToken(accessToken: string): User {
    try {
      const decoded = jwtDecode<User>(accessToken);
      return decoded;
    } catch (error) {
      logger.error('Failed to decode user from token', error, {
        operation: 'getUserFromToken',
      });
      const err = new Error('Failed to decode user from token');
      throw err;
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
