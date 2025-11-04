import React, { createContext, useContext, useReducer, useEffect, useCallback, PropsWithChildren } from 'react';
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

export const AuthProvider = ({ children }: PropsWithChildren) => {
    const [authState, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        const setUnauthenticated = async () => {
            await credentialStorageService.clearAllCredentials();
            dispatch({ type: AUTH_ACTIONS.SET_UNAUTHENTICATED });
        };

        const setAuthenticated = (user: User, tokens: AuthTokens) => {
            dispatch({
                type: AUTH_ACTIONS.SET_AUTHENTICATED,
                payload: { user, tokens },
            });
        };

        const loadStoredAuth = async () => {
            try {
                const { tokens, user } = await credentialStorageService.loadStoredCredentials();
                if (!tokens || !user) {
                    await setUnauthenticated();
                    return;
                }
                if (!authService.isTokenExpired(tokens.expiresAt)) {
                    setAuthenticated(user, tokens);
                    return;
                }
                if (!tokens.refreshToken) {
                    await setUnauthenticated();
                    return;
                }

                const newTokens = await authService.refreshAccessToken(tokens.refreshToken);
                await credentialStorageService.storeTokens(newTokens);
                setAuthenticated(user, newTokens);
            } catch (error) {
                console.error('Failed to load stored auth:', error instanceof Error ? error.message : error);
                await setUnauthenticated();
            }
        };

        loadStoredAuth();
    }, []);

    const logout = useCallback(async () => {
        try {
            if (authState.tokens?.accessToken) {
                await authService.logout(authState.tokens.accessToken);
            }
        } catch (error) {
            console.error('Logout API error:', error instanceof Error ? error.message : error);
        } finally {
            await credentialStorageService.clearAllCredentials();
            dispatch({ type: AUTH_ACTIONS.SET_UNAUTHENTICATED });
        }
    }, [authState.tokens?.accessToken]);

    const refreshAuth = useCallback(async () => {
        try {
            if (!authState.tokens?.refreshToken) {
                throw new Error('No refresh token available');
            }

            const newTokens = await authService.refreshAccessToken(authState.tokens.refreshToken);
            await credentialStorageService.storeTokens(newTokens);

            dispatch({
                type: AUTH_ACTIONS.UPDATE_TOKENS,
                payload: newTokens,
            });
        } catch (error) {
            console.error('Failed to refresh auth:', error instanceof Error ? error.message : error);
            await logout();
        }
    }, [authState.tokens?.refreshToken, logout]);




    useEffect(() => {
        const REFRESH_BUFFER_MINUTES = 5;
        const REFRESH_BUFFER_MS = REFRESH_BUFFER_MINUTES * 60 * 1000;

        const calculateTimeUntilRefresh = (expiresAt: number): number => {
            const tokenExpiryMs = expiresAt * 1000;
            const currentTimeMs = Date.now();
            return tokenExpiryMs - currentTimeMs - REFRESH_BUFFER_MS;
        };

        if (!authState.tokens || authState.state !== 'authenticated') {
            return;
        }

        if (!authState.tokens.expiresAt) {
            return;
        }

        const timeUntilRefresh = calculateTimeUntilRefresh(authState.tokens.expiresAt);
        if (timeUntilRefresh <= 0) {
            console.warn('Token is expiring soon, refreshing immediately');
            refreshAuth();
            return;
        }

        const timer = setTimeout(() => {
            refreshAuth();
        }, timeUntilRefresh);

        return () => clearTimeout(timer);
    }, [authState.tokens, authState.state, refreshAuth]);

    const sendPasswordlessEmail = async (email: string) => {
        try {
            await authService.sendPasswordlessEmail(email);
        } catch (error) {
            console.error('Send passwordless email error:', error instanceof Error ? error.message : error);
            throw error;
        }
    };

    const login = async (email: string, otp: string) => {
        try {
            dispatch({ type: AUTH_ACTIONS.SET_LOADING });

            const tokens = await authService.verifyPasswordlessOtp(email, otp);
            const user = await authService.getUserProfile(tokens.accessToken);

            await Promise.all([
                credentialStorageService.storeTokens(tokens),
                credentialStorageService.storeUser(user),
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
            console.error('Resend passwordless email error:', error instanceof Error ? error.message : error);
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