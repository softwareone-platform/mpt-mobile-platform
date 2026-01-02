import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import { AuthTokens, User } from '../services/authService';
import { credentialStorageService } from '../services/credentialStorageService';

jest.mock('expo-secure-store');
jest.mock('@react-native-async-storage/async-storage');

const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('CredentialStorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Core Security Requirements', () => {
    const mockTokens: AuthTokens = {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresAt: 1699123456,
      tokenType: 'Bearer',
    };

    it('should NEVER store access tokens in persistent storage', async () => {
      mockSecureStore.setItemAsync.mockResolvedValue();
      mockAsyncStorage.setItem.mockResolvedValue();

      await credentialStorageService.storeTokens(mockTokens);

      // Verify access token is never stored anywhere
      const asyncStorageCall = mockAsyncStorage.setItem.mock.calls[0];
      const storedData = JSON.parse(asyncStorageCall[1]);
      expect(storedData).not.toHaveProperty('accessToken');
      expect(storedData).not.toHaveProperty('refreshToken');
    });

    it('should store refresh token in SecureStore and metadata in AsyncStorage', async () => {
      mockSecureStore.setItemAsync.mockResolvedValue();
      mockAsyncStorage.setItem.mockResolvedValue();

      await credentialStorageService.storeTokens(mockTokens);

      // Verify refresh token stored securely
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        'auth_refresh_token',
        'mock-refresh-token',
      );

      // Verify only metadata stored in AsyncStorage
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'auth_tokens',
        JSON.stringify({
          expiresAt: 1699123456,
          tokenType: 'Bearer',
        }),
      );
    });

    it('should handle missing refresh token gracefully', async () => {
      const tokensWithoutRefresh: AuthTokens = {
        accessToken: 'mock-access-token',
        expiresAt: 1699123456,
        tokenType: 'Bearer',
      };

      mockAsyncStorage.setItem.mockResolvedValue();

      await credentialStorageService.storeTokens(tokensWithoutRefresh);

      expect(mockSecureStore.setItemAsync).not.toHaveBeenCalled();
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('Basic Operations', () => {
    it('should clear all stored credentials', async () => {
      mockAsyncStorage.removeItem.mockResolvedValue();
      mockSecureStore.deleteItemAsync.mockResolvedValue();

      await credentialStorageService.clearAllCredentials();

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('auth_tokens');
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('auth_user');
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_refresh_token');
    });

    it('should check stored credentials existence', async () => {
      mockAsyncStorage.getItem
        .mockResolvedValueOnce('{"expiresAt":123}')
        .mockResolvedValueOnce('{"sub":"auth0|123"}');

      const result = await credentialStorageService.hasStoredCredentials();

      expect(result).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle storage errors gracefully', async () => {
      const mockTokens: AuthTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresAt: 1699123456,
        tokenType: 'Bearer',
      };

      mockSecureStore.setItemAsync.mockRejectedValue(new Error('SecureStore error'));
      mockAsyncStorage.setItem.mockRejectedValue(new Error('AsyncStorage error'));

      await expect(credentialStorageService.storeTokens(mockTokens)).resolves.toBeUndefined();
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle retrieval errors gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const result = await credentialStorageService.hasStoredCredentials();

      expect(result).toBe(false);
    });

    it('should handle error when clearing credentials', async () => {
      mockAsyncStorage.removeItem.mockRejectedValue(new Error('Clear error'));

      await expect(credentialStorageService.clearAllCredentials()).resolves.toBeUndefined();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('loadTokens', () => {
    it('should load tokens with both metadata and refresh token', async () => {
      const metadata = { expiresAt: 1699123456, tokenType: 'Bearer' };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(metadata));
      mockSecureStore.getItemAsync.mockResolvedValue('refresh-token-123');

      const result = await credentialStorageService.loadTokens();

      expect(result.refreshToken).toBe('refresh-token-123');
      expect(result.metadata).toEqual(metadata);
    });

    it('should handle missing token metadata', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockSecureStore.getItemAsync.mockResolvedValue('refresh-token-123');

      const result = await credentialStorageService.loadTokens();

      expect(result.refreshToken).toBe('refresh-token-123');
      expect(result.metadata).toBeNull();
    });

    it('should handle missing refresh token', async () => {
      const metadata = { expiresAt: 1699123456, tokenType: 'Bearer' };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(metadata));
      mockSecureStore.getItemAsync.mockResolvedValue(null);

      const result = await credentialStorageService.loadTokens();

      expect(result.refreshToken).toBeNull();
      expect(result.metadata).toEqual(metadata);
    });

    it('should handle load error and return null values', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Load failed'));

      const result = await credentialStorageService.loadTokens();

      expect(result.refreshToken).toBeNull();
      expect(result.metadata).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('storeUser', () => {
    it('should store user data', async () => {
      const mockUser: User = {
        sub: 'auth0|123',
        email: 'test@example.com',
        name: 'Test User',
      };

      mockAsyncStorage.setItem.mockResolvedValue();

      await credentialStorageService.storeUser(mockUser);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('auth_user', JSON.stringify(mockUser));
    });

    it('should handle error when storing user', async () => {
      const mockUser: User = { sub: 'auth0|123' };
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Store failed'));

      await expect(credentialStorageService.storeUser(mockUser)).resolves.toBeUndefined();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('loadUser', () => {
    it('should load user data successfully', async () => {
      const mockUser: User = {
        sub: 'auth0|123',
        email: 'test@example.com',
        name: 'Test User',
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockUser));

      const result = await credentialStorageService.loadUser();

      expect(result).toEqual(mockUser);
    });

    it('should return null when no user data stored', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await credentialStorageService.loadUser();

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('No stored user data found');
    });

    it('should handle load error and return null', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Load failed'));

      const result = await credentialStorageService.loadUser();

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('loadStoredCredentials', () => {
    it('should load both tokens and user data', async () => {
      const metadata = { expiresAt: 1699123456, tokenType: 'Bearer' };
      const mockUser: User = { sub: 'auth0|123', email: 'test@example.com' };

      mockAsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify(metadata))
        .mockResolvedValueOnce(JSON.stringify(mockUser));
      mockSecureStore.getItemAsync.mockResolvedValue('refresh-token-123');

      const result = await credentialStorageService.loadStoredCredentials();

      expect(result.refreshToken).toBe('refresh-token-123');
      expect(result.metadata).toEqual(metadata);
      expect(result.user).toEqual(mockUser);
    });

    it('should handle error and return null values', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Load failed'));

      const result = await credentialStorageService.loadStoredCredentials();

      expect(result.refreshToken).toBeNull();
      expect(result.metadata).toBeNull();
      expect(result.user).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('storeCredentials', () => {
    it('should store both tokens and user', async () => {
      const mockTokens: AuthTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresAt: 1699123456,
        tokenType: 'Bearer',
      };
      const mockUser: User = { sub: 'auth0|123', email: 'test@example.com' };

      mockSecureStore.setItemAsync.mockResolvedValue();
      mockAsyncStorage.setItem.mockResolvedValue();

      await credentialStorageService.storeCredentials(mockTokens, mockUser);

      expect(mockSecureStore.setItemAsync).toHaveBeenCalled();
      expect(mockAsyncStorage.setItem).toHaveBeenCalledTimes(2); // tokens metadata and user
    });

    it('should handle error when storing credentials', async () => {
      const mockTokens: AuthTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresAt: 1699123456,
        tokenType: 'Bearer',
      };
      const mockUser: User = { sub: 'auth0|123' };

      mockAsyncStorage.setItem.mockRejectedValue(new Error('Store failed'));

      await expect(
        credentialStorageService.storeCredentials(mockTokens, mockUser),
      ).resolves.toBeUndefined();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('hasStoredCredentials', () => {
    it('should return true when both tokens and user exist', async () => {
      mockAsyncStorage.getItem
        .mockResolvedValueOnce('{"expiresAt":123}')
        .mockResolvedValueOnce('{"sub":"auth0|123"}');

      const result = await credentialStorageService.hasStoredCredentials();

      expect(result).toBe(true);
    });

    it('should return false when tokens are missing', async () => {
      mockAsyncStorage.getItem
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce('{"sub":"auth0|123"}');

      const result = await credentialStorageService.hasStoredCredentials();

      expect(result).toBe(false);
    });

    it('should return false when user is missing', async () => {
      mockAsyncStorage.getItem
        .mockResolvedValueOnce('{"expiresAt":123}')
        .mockResolvedValueOnce(null);

      const result = await credentialStorageService.hasStoredCredentials();

      expect(result).toBe(false);
    });

    it('should return false when both are missing', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await credentialStorageService.hasStoredCredentials();

      expect(result).toBe(false);
    });
  });

  describe('getStorageKeys', () => {
    it('should return storage keys', () => {
      const keys = credentialStorageService.getStorageKeys();

      expect(keys).toEqual({
        TOKENS: 'auth_tokens',
        REFRESH_TOKEN: 'auth_refresh_token',
        USER: 'auth_user',
      });
    });

    it('should return a copy of storage keys (not reference)', () => {
      const keys1 = credentialStorageService.getStorageKeys();
      const keys2 = credentialStorageService.getStorageKeys();

      expect(keys1).toEqual(keys2);
      expect(keys1).not.toBe(keys2); // Different objects
    });
  });
});
