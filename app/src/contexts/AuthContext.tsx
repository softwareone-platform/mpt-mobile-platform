import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import authService, { AuthTokens, User } from '@/services/authService';
import credentialStorageService from '@/services/credentialStorageService';

export type AuthState = 'loading' | 'unauthenticated' | 'authenticated';

const AUTH_ACTIONS = {
    SET_LOADING: 'SET_LOADING',
    SET_AUTHENTICATED: 'SET_AUTHENTICATED',
    SET_UNAUTHENTICATED: 'SET_UNAUTHENTICATED',
    UPDATE_TOKENS: 'UPDATE_TOKENS',
} as const;

interface AuthContextType {
    state: AuthState;
    user: User | null;
    tokens: AuthTokens | null;
    login: (email: string, otp: string) => Promise<void>;
    logout: () => Promise<void>;
    sendPasswordlessEmail: (email: string) => Promise<void>;
    resendPasswordlessEmail: (email: string) => Promise<void>;
    refreshAuth: () => Promise<void>;
}

type AuthAction =
    | { type: typeof AUTH_ACTIONS.SET_LOADING }
    | { type: typeof AUTH_ACTIONS.SET_AUTHENTICATED; payload: { user: User; tokens: AuthTokens } }
    | { type: typeof AUTH_ACTIONS.SET_UNAUTHENTICATED }
    | { type: typeof AUTH_ACTIONS.UPDATE_TOKENS; payload: AuthTokens };

interface AuthReducerState {
    state: AuthState;
    user: User | null;
    tokens: AuthTokens | null;
}

const authReducer = (state: AuthReducerState, action: AuthAction): AuthReducerState => {
    switch (action.type) {
        case AUTH_ACTIONS.SET_LOADING:
            return {
                ...state,
                state: 'loading',
            };
        case AUTH_ACTIONS.SET_AUTHENTICATED:
            return {
                state: 'authenticated',
                user: action.payload.user,
                tokens: action.payload.tokens,
            };
        case AUTH_ACTIONS.SET_UNAUTHENTICATED:
            return {
                state: 'unauthenticated',
                user: null,
                tokens: null,
            };
        case AUTH_ACTIONS.UPDATE_TOKENS:
            return {
                ...state,
                tokens: action.payload,
            };
        default:
            return state;
    }
};

const initialState: AuthReducerState = {
    state: 'loading',
    user: null,
    tokens: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [authState, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        loadStoredAuth();
    }, []);

    const logout = useCallback(async () => {
        try {
            if (authState.tokens?.accessToken) {
                await authService.logout(authState.tokens.accessToken);
            }
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            await clearStoredAuth();
            dispatch({ type: AUTH_ACTIONS.SET_UNAUTHENTICATED });
        }
    }, [authState.tokens?.accessToken]);

    const refreshAuth = useCallback(async () => {
        try {
            if (!authState.tokens?.refreshToken) {
                throw new Error('No refresh token available');
            }

            const newTokens = await authService.refreshAccessToken(authState.tokens.refreshToken);
            await storeTokens(newTokens);

            console.log('Refreshed tokens successfully', newTokens.accessToken);

            dispatch({
                type: AUTH_ACTIONS.UPDATE_TOKENS,
                payload: newTokens,
            });
        } catch (error) {
            console.error('Failed to refresh auth:', error);
            await logout();
        }
    }, [authState.tokens?.refreshToken, logout]);

    useEffect(() => {
        if (authState.tokens && authState.state === 'authenticated') {
            const expiresAt = authState.tokens.expiresAt;
            if (expiresAt) {
                const timeUntilExpiry = (expiresAt * 1000) - Date.now() - (5 * 60 * 1000); // 5 minutes before expiry

                if (timeUntilExpiry > 0) {
                    const timer = setTimeout(() => {
                        refreshAuth();
                    }, timeUntilExpiry);

                    return () => clearTimeout(timer);
                } else {
                    console.warn('Token is expiring soon');
                    refreshAuth();
                }
            }
        }
    }, [authState.tokens, authState.state, refreshAuth]);

    const loadStoredAuth = async () => {
        try {
            const { tokens, user } = await credentialStorageService.loadStoredCredentials();

            if (tokens && user) {
                if (!authService.isTokenExpired(tokens.expiresAt)) {
                    dispatch({
                        type: AUTH_ACTIONS.SET_AUTHENTICATED,
                        payload: { user, tokens },
                    });
                } else {
                    if (tokens.refreshToken) {
                        try {
                            const newTokens = await authService.refreshAccessToken(tokens.refreshToken);
                            await credentialStorageService.storeTokens(newTokens);
                            dispatch({
                                type: AUTH_ACTIONS.SET_AUTHENTICATED,
                                payload: { user, tokens: newTokens },
                            });
                        } catch (error) {
                            console.error('Failed to refresh tokens:', error);
                            await credentialStorageService.clearAllCredentials();
                            dispatch({ type: AUTH_ACTIONS.SET_UNAUTHENTICATED });
                        }
                    } else {
                        await credentialStorageService.clearAllCredentials();
                        dispatch({ type: AUTH_ACTIONS.SET_UNAUTHENTICATED });
                    }
                }
            } else {
                dispatch({ type: AUTH_ACTIONS.SET_UNAUTHENTICATED });
            }
        } catch (error) {
            console.error('Failed to load stored auth:', error);
            dispatch({ type: AUTH_ACTIONS.SET_UNAUTHENTICATED });
        }
    };

    const storeTokens = async (tokens: AuthTokens) => {
        await credentialStorageService.storeTokens(tokens);
    };

    const storeUser = async (user: User) => {
        await credentialStorageService.storeUser(user);
    };

    const clearStoredAuth = async () => {
        await credentialStorageService.clearAllCredentials();
    };

    const sendPasswordlessEmail = async (email: string) => {
        try {
            await authService.sendPasswordlessEmail(email);
        } catch (error) {
            console.error('Send passwordless email error:', error);
            throw error;
        }
    };

    const login = async (email: string, otp: string) => {
        try {
            dispatch({ type: AUTH_ACTIONS.SET_LOADING });

            const tokens = await authService.verifyPasswordlessOtp(email, otp);
            const user = await authService.getUserProfile(tokens.accessToken);

            await Promise.all([
                storeTokens(tokens),
                storeUser(user),
            ]);

            dispatch({
                type: AUTH_ACTIONS.SET_AUTHENTICATED,
                payload: {
                    user,
                    tokens,
                },
            });
        } catch (error) {
            dispatch({ type: AUTH_ACTIONS.SET_UNAUTHENTICATED });
            throw error;
        }
    };

    const resendPasswordlessEmail = async (email: string) => {
        try {
            await authService.resendPasswordlessEmail(email);
        } catch (error) {
            console.error('Resend passwordless email error:', error);
            throw error;
        }
    };

    const value: AuthContextType = {
        state: authState.state,
        user: authState.user,
        tokens: authState.tokens,
        login,
        logout,
        sendPasswordlessEmail,
        resendPasswordlessEmail,
        refreshAuth,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;