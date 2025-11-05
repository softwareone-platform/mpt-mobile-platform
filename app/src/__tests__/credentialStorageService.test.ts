import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { credentialStorageService } from '../services/credentialStorageService';
import { AuthTokens, User } from '../services/authService';

jest.mock('expo-secure-store');
jest.mock('@react-native-async-storage/async-storage');

const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('CredentialStorageService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
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
                'mock-refresh-token'
            );

            // Verify only metadata stored in AsyncStorage
            expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
                'auth_tokens',
                JSON.stringify({
                    expiresAt: 1699123456,
                    tokenType: 'Bearer',
                })
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
        });

        it('should handle retrieval errors gracefully', async () => {
            mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

            const result = await credentialStorageService.hasStoredCredentials();

            expect(result).toBe(false);
        });
    });
});