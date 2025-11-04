import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthTokens, User } from './authService';

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

            const { refreshToken: _, ...tokenDataWithoutRefresh } = tokens;
            await AsyncStorage.setItem(this.STORAGE_KEYS.TOKENS, JSON.stringify(tokenDataWithoutRefresh));

        } catch (error) {
            console.error('Failed to store tokens:', error);
            throw new Error('Failed to store authentication tokens');
        }
    }

    async loadTokens(): Promise<AuthTokens | null> {
        try {
            const [storedTokenData, storedRefreshToken] = await Promise.all([
                AsyncStorage.getItem(this.STORAGE_KEYS.TOKENS),
                SecureStore.getItemAsync(this.STORAGE_KEYS.REFRESH_TOKEN),
            ]);

            if (!storedTokenData) {
                console.log('No stored tokens found');
                return null;
            }

            const tokenData = JSON.parse(storedTokenData);

            const tokens: AuthTokens = {
                ...tokenData,
                refreshToken: storedRefreshToken || undefined,
            };

            return tokens;
        } catch (error) {
            console.error('Failed to load tokens:', error);
            return null;
        }
    }

    async storeUser(user: User): Promise<void> {
        try {
            await AsyncStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(user));
        } catch (error) {
            console.error('Failed to store user data:', error);
            throw new Error('Failed to store user data');
        }
    }

    async loadUser(): Promise<User | null> {
        try {
            const storedUser = await AsyncStorage.getItem(this.STORAGE_KEYS.USER);

            if (!storedUser) {
                console.log('No stored user data found');
                return null;
            }

            const user: User = JSON.parse(storedUser);
            return user;
        } catch (error) {
            console.error('Failed to load user data:', error);
            return null;
        }
    }

    async loadStoredCredentials(): Promise<{ tokens: AuthTokens | null; user: User | null }> {
        try {
            const [tokens, user] = await Promise.all([
                this.loadTokens(),
                this.loadUser(),
            ]);

            return { tokens, user };
        } catch (error) {
            console.error('Failed to load stored credentials:', error);
            return { tokens: null, user: null };
        }
    }


    async storeCredentials(tokens: AuthTokens, user: User): Promise<void> {
        try {
            await Promise.all([
                this.storeTokens(tokens),
                this.storeUser(user),
            ]);
        } catch (error) {
            console.error('Failed to store credentials:', error);
            throw new Error('Failed to store credentials');
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
            console.error('Failed to clear credentials:', error);
            throw new Error('Failed to clear credentials');
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
            console.error('Failed to check stored credentials:', error);
            return false;
        }
    }

    getStorageKeys(): StorageKeys {
        return { ...this.STORAGE_KEYS };
    }
}

export const credentialStorageService = new CredentialStorageService();
export default credentialStorageService;