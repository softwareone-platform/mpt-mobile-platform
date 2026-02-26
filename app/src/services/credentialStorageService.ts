import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import { AuthTokens, User } from './authService';
import { logger } from './loggerService';

export interface StorageKeys {
  TOKENS: string;
  REFRESH_TOKEN: string;
  USER: string;
}

class CredentialStorageService {
  private readonly STORAGE_KEYS: StorageKeys = {
    TOKENS: 'auth_tokens',
    REFRESH_TOKEN: 'auth_refresh_token',
    USER: 'auth_user',
  };

  async storeTokens(tokens: AuthTokens): Promise<void> {
    try {
      if (tokens.refreshToken) {
        await SecureStore.setItemAsync(this.STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
      }

      const tokenMetadata = {
        expiresAt: tokens.expiresAt,
        tokenType: tokens.tokenType,
      };
      await AsyncStorage.setItem(this.STORAGE_KEYS.TOKENS, JSON.stringify(tokenMetadata));
    } catch (error) {
      logger.error('Failed to store tokens', error, {
        operation: 'storeTokens',
      });
    }
  }

  async loadTokens(): Promise<{
    refreshToken: string | null;
    metadata: { expiresAt?: number; tokenType?: string } | null;
  }> {
    try {
      const [storedTokenMetadata, storedRefreshToken] = await Promise.all([
        AsyncStorage.getItem(this.STORAGE_KEYS.TOKENS),
        SecureStore.getItemAsync(this.STORAGE_KEYS.REFRESH_TOKEN),
      ]);

      let metadata = null;
      if (storedTokenMetadata) {
        metadata = JSON.parse(storedTokenMetadata);
      }

      return {
        refreshToken: storedRefreshToken,
        metadata,
      };
    } catch (error) {
      logger.error('Failed to load tokens', error, {
        operation: 'loadTokens',
      });
      return { refreshToken: null, metadata: null };
    }
  }

  async storeUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      logger.error('Failed to store user data', error, {
        operation: 'storeUser',
      });
    }
  }

  async loadUser(): Promise<User | null> {
    try {
      const storedUser = await AsyncStorage.getItem(this.STORAGE_KEYS.USER);

      if (!storedUser) {
        logger.error('No stored user data found', undefined, {
          operation: 'loadUser',
        });
        return null;
      }

      const user: User = JSON.parse(storedUser);
      return user;
    } catch (error) {
      logger.error('Failed to load user data', error, {
        operation: 'loadUser',
      });
      return null;
    }
  }

  async loadStoredCredentials(): Promise<{
    refreshToken: string | null;
    user: User | null;
    metadata: { expiresAt?: number; tokenType?: string } | null;
  }> {
    try {
      const [tokenData, user] = await Promise.all([this.loadTokens(), this.loadUser()]);

      return {
        refreshToken: tokenData.refreshToken,
        metadata: tokenData.metadata,
        user,
      };
    } catch (error) {
      logger.error('Failed to load stored credentials', error, {
        operation: 'loadStoredCredentials',
      });
      return { refreshToken: null, metadata: null, user: null };
    }
  }

  async storeCredentials(tokens: AuthTokens, user: User): Promise<void> {
    try {
      await Promise.all([this.storeTokens(tokens), this.storeUser(user)]);
    } catch (error) {
      logger.error('Failed to store credentials', error, {
        operation: 'storeCredentials',
      });
    }
  }

  async clearAllCredentials(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(this.STORAGE_KEYS.TOKENS),
        AsyncStorage.removeItem(this.STORAGE_KEYS.USER),
        SecureStore.deleteItemAsync(this.STORAGE_KEYS.REFRESH_TOKEN),
      ]);
    } catch (error) {
      logger.error('Failed to clear credentials', error, {
        operation: 'clearAllCredentials',
      });
    }
  }

  async hasStoredCredentials(): Promise<boolean> {
    try {
      const [tokenData, userData] = await Promise.all([
        AsyncStorage.getItem(this.STORAGE_KEYS.TOKENS),
        AsyncStorage.getItem(this.STORAGE_KEYS.USER),
      ]);

      return !!(tokenData && userData);
    } catch (error) {
      logger.error('Failed to check stored credentials', error, {
        operation: 'hasStoredCredentials',
      });
      return false;
    }
  }

  getStorageKeys(): StorageKeys {
    return { ...this.STORAGE_KEYS };
  }
}

export const credentialStorageService = new CredentialStorageService();
export default credentialStorageService;
