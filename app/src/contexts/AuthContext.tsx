import React, { createContext, useContext, useReducer, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import authService, { AuthTokens, User } from '@/services/authService';

export type AuthState = 'loading' | 'unauthenticated' | 'authenticated';

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
  | { type: 'SET_LOADING' }
  | { type: 'SET_AUTHENTICATED'; payload: { user: User; tokens: AuthTokens } }
  | { type: 'SET_UNAUTHENTICATED' }
  | { type: 'UPDATE_TOKENS'; payload: AuthTokens };

interface AuthReducerState {
  state: AuthState;
  user: User | null;
  tokens: AuthTokens | null;
}

const STORAGE_KEYS = {
  TOKENS: 'auth_tokens',
  USER: 'auth_user',
} as const;

const authReducer = (state: AuthReducerState, action: AuthAction): AuthReducerState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        state: 'loading',
      };
    case 'SET_AUTHENTICATED':
      return {
        state: 'authenticated',
        user: action.payload.user,
        tokens: action.payload.tokens,
      };
    case 'SET_UNAUTHENTICATED':
      return {
        state: 'unauthenticated',
        user: null,
        tokens: null,
      };
    case 'UPDATE_TOKENS':
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

  useEffect(() => {
    if (authState.tokens && authState.state === 'authenticated') {
      const { expiresAt } = authState.tokens;
      if (expiresAt) {
        const timeUntilExpiry = (expiresAt * 1000) - Date.now() - (5 * 60 * 1000);
        
        if (timeUntilExpiry > 0) {
          const timer = setTimeout(() => {
            refreshAuth();
          }, timeUntilExpiry);
          
          return () => clearTimeout(timer);
        } else {
          refreshAuth();
        }
      }
    }
  }, [authState.tokens]);

  const loadStoredAuth = async () => {
    try {
      const [storedTokens, storedUser] = await Promise.all([
        SecureStore.getItemAsync(STORAGE_KEYS.TOKENS),
        SecureStore.getItemAsync(STORAGE_KEYS.USER),
      ]);

      if (storedTokens && storedUser) {
        const tokens: AuthTokens = JSON.parse(storedTokens);
        const user: User = JSON.parse(storedUser);

        if (!authService.isTokenExpired(tokens.expiresAt)) {
          dispatch({
            type: 'SET_AUTHENTICATED',
            payload: { user, tokens },
          });
        } else {
          if (tokens.refreshToken) {
            try {
              const newTokens = await authService.refreshAccessToken(tokens.refreshToken);
              await storeTokens(newTokens);
              dispatch({
                type: 'SET_AUTHENTICATED',
                payload: { user, tokens: newTokens },
              });
            } catch (error) {
              console.error('Failed to refresh tokens:', error);
              await clearStoredAuth();
              dispatch({ type: 'SET_UNAUTHENTICATED' });
            }
          } else {
            await clearStoredAuth();
            dispatch({ type: 'SET_UNAUTHENTICATED' });
          }
        }
      } else {
        dispatch({ type: 'SET_UNAUTHENTICATED' });
      }
    } catch (error) {
      console.error('Failed to load stored auth:', error);
      dispatch({ type: 'SET_UNAUTHENTICATED' });
    }
  };

  const storeTokens = async (tokens: AuthTokens) => {
    await SecureStore.setItemAsync(STORAGE_KEYS.TOKENS, JSON.stringify(tokens));
  };

  const storeUser = async (user: User) => {
    await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(user));
  };

  const clearStoredAuth = async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(STORAGE_KEYS.TOKENS),
      SecureStore.deleteItemAsync(STORAGE_KEYS.USER),
    ]);
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
      dispatch({ type: 'SET_LOADING' });

      const tokens = await authService.verifyPasswordlessOtp(email, otp);
      const user = await authService.getUserProfile(tokens.accessToken);

      await Promise.all([
        storeTokens(tokens),
        storeUser(user),
      ]);

      dispatch({
        type: 'SET_AUTHENTICATED',
        payload: {
          user,
          tokens,
        },
      });
    } catch (error) {
      dispatch({ type: 'SET_UNAUTHENTICATED' });
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (authState.tokens?.accessToken) {
        await authService.logout(authState.tokens.accessToken);
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      await clearStoredAuth();
      dispatch({ type: 'SET_UNAUTHENTICATED' });
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

  const refreshAuth = async () => {
    try {
      if (!authState.tokens?.refreshToken) {
        throw new Error('No refresh token available');
      }

      const newTokens = await authService.refreshAccessToken(authState.tokens.refreshToken);
      await storeTokens(newTokens);
      
      dispatch({
        type: 'UPDATE_TOKENS',
        payload: newTokens,
      });
    } catch (error) {
      console.error('Failed to refresh auth:', error);
      await logout();
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