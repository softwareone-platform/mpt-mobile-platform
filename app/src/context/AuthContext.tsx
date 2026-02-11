import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  PropsWithChildren,
} from 'react';

import { usePortalVersion } from '@/hooks/queries/usePortalVersion';
import { tokenProvider } from '@/lib/tokenProvider';
import authService, { AuthTokens, User } from '@/services/authService';
import credentialStorageService from '@/services/credentialStorageService';
import { moduleClaimsService } from '@/services/moduleClaimsService';
import { PortalVersionInfo } from '@/services/portalVersionService';
import { AccountType } from '@/types/common';
import { ModuleClaims } from '@/types/modules';

export type AuthState = 'loading' | 'unauthenticated' | 'authenticated';

const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_AUTHENTICATED: 'SET_AUTHENTICATED',
  SET_UNAUTHENTICATED: 'SET_UNAUTHENTICATED',
  UPDATE_TOKENS: 'UPDATE_TOKENS',
} as const;

interface AuthContextType {
  status: AuthState;
  user: User | null;
  tokens: AuthTokens | null;
  portalVersion: PortalVersionInfo;
  moduleClaims: ModuleClaims | null;
  accountType: AccountType | null;
  login: (email: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordlessEmail: (email: string) => Promise<void>;
  resendPasswordlessEmail: (email: string) => Promise<void>;
  refreshAuth: () => Promise<AuthTokens | null>;
  getAccessToken: () => Promise<string | null>;
}

type AuthAction =
  | { type: typeof AUTH_ACTIONS.SET_LOADING }
  | { type: typeof AUTH_ACTIONS.SET_AUTHENTICATED; payload: { user: User; tokens: AuthTokens } }
  | { type: typeof AUTH_ACTIONS.SET_UNAUTHENTICATED }
  | { type: typeof AUTH_ACTIONS.UPDATE_TOKENS; payload: AuthTokens };

interface AuthReducerState {
  status: AuthState;
  user: User | null;
  tokens: AuthTokens | null;
}

const authReducer = (state: AuthReducerState, action: AuthAction): AuthReducerState => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        status: 'loading',
      };
    case AUTH_ACTIONS.SET_AUTHENTICATED:
      return {
        status: 'authenticated',
        user: action.payload.user,
        tokens: action.payload.tokens,
      };
    case AUTH_ACTIONS.SET_UNAUTHENTICATED:
      return {
        status: 'unauthenticated',
        user: null,
        tokens: null,
      };
    case AUTH_ACTIONS.UPDATE_TOKENS: {
      const updatedUser = authService.getUserFromToken(action.payload.accessToken);
      return {
        ...state,
        user: updatedUser,
        tokens: action.payload,
      };
    }
    default:
      return state;
  }
};

const initialState: AuthReducerState = {
  status: 'loading',
  user: null,
  tokens: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [authState, dispatch] = useReducer(authReducer, initialState);
  const REFRESH_BUFFER_MINUTES = 5;
  const REFRESH_BUFFER_MS = REFRESH_BUFFER_MINUTES * 60 * 1000;

  const { data: portalVersion = { fullVersion: '', major: 0, minor: 0, patch: 0 } } =
    usePortalVersion(authState.status === 'authenticated');

  const setUnauthenticated = useCallback(async () => {
    await credentialStorageService.clearAllCredentials();
    dispatch({ type: AUTH_ACTIONS.SET_UNAUTHENTICATED });
  }, []);

  const setAuthenticated = useCallback((user: User, tokens: AuthTokens) => {
    dispatch({
      type: AUTH_ACTIONS.SET_AUTHENTICATED,
      payload: { user, tokens },
    });
  }, []);

  const loadStoredAuth = useCallback(async () => {
    try {
      const { refreshToken, user } = await credentialStorageService.loadStoredCredentials();
      if (!refreshToken || !user) {
        await setUnauthenticated();
        return;
      }

      const newTokens = await authService.refreshAccessToken(refreshToken);
      await credentialStorageService.storeTokens(newTokens);
      setAuthenticated(user, newTokens);
    } catch (error) {
      console.error('Failed to load stored auth:', error instanceof Error ? error.message : error);
      await setUnauthenticated();
    }
  }, [setUnauthenticated, setAuthenticated]);

  useEffect(() => {
    void loadStoredAuth();
  }, [loadStoredAuth]);

  const logout = useCallback(async () => {
    try {
      if (authState.tokens?.refreshToken) {
        await authService.logout(authState.tokens.refreshToken);
      }
    } catch (error) {
      console.error('Logout API error:', error instanceof Error ? error.message : error);
    } finally {
      await credentialStorageService.clearAllCredentials();
      dispatch({ type: AUTH_ACTIONS.SET_UNAUTHENTICATED });
    }
  }, [authState.tokens?.refreshToken]);

  const refreshAuth = useCallback(async (): Promise<AuthTokens | null> => {
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

      return newTokens;
    } catch (error) {
      console.error('Failed to refresh auth:', error instanceof Error ? error.message : error);
      await logout();
      return null;
    }
  }, [authState.tokens?.refreshToken, logout]);

  const calculateTimeUntilRefresh = useCallback(
    (expiresAt: number): number => {
      const tokenExpiryMs = expiresAt * 1000;
      const currentTimeMs = Date.now();
      return tokenExpiryMs - currentTimeMs - REFRESH_BUFFER_MS;
    },
    [REFRESH_BUFFER_MS],
  );

  useEffect(() => {
    if (!authState.tokens || authState.status !== 'authenticated') {
      return;
    }

    if (!authState.tokens.expiresAt) {
      return;
    }

    const timeUntilRefresh = calculateTimeUntilRefresh(authState.tokens.expiresAt);
    if (timeUntilRefresh <= 0) {
      console.warn('Token is expiring soon, refreshing immediately');
      void refreshAuth();
      return;
    }

    const timer = setTimeout(() => {
      void refreshAuth();
    }, timeUntilRefresh);

    return () => clearTimeout(timer);
  }, [authState.tokens, authState.status, refreshAuth, calculateTimeUntilRefresh]);

  const sendPasswordlessEmail = async (email: string) => {
    try {
      await authService.sendPasswordlessEmail(email);
    } catch (error) {
      console.error(
        'Send passwordless email error:',
        error instanceof Error ? error.message : error,
      );
      throw error;
    }
  };

  const login = async (email: string, otp: string) => {
    const tokens = await authService.verifyPasswordlessOtp(email, otp);
    const user = authService.getUserFromToken(tokens.accessToken);

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
  };

  const resendPasswordlessEmail = async (email: string) => {
    try {
      await authService.resendPasswordlessEmail(email);
    } catch (error) {
      console.error(
        'Resend passwordless email error:',
        error instanceof Error ? error.message : error,
      );
      throw error;
    }
  };

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    if (authState.status !== 'authenticated' || !authState.tokens) {
      return null;
    }

    if (!authService.isTokenExpired(authState.tokens.expiresAt)) {
      return authState.tokens.accessToken;
    }

    try {
      const newTokens = await refreshAuth();
      return newTokens?.accessToken ?? authState.tokens?.accessToken ?? null;
    } catch (error) {
      console.error(
        'Failed to refresh token for API call:',
        error instanceof Error ? error.message : error,
      );
      return null;
    }
  }, [authState.status, authState.tokens, refreshAuth]);

  const moduleClaims = useMemo(() => {
    if (!authState.tokens?.accessToken) return null;
    return moduleClaimsService.getModuleClaims(authState.tokens.accessToken);
  }, [authState.tokens?.accessToken]);

  const accountType = useMemo(() => {
    if (!authState.tokens?.accessToken) return null;
    return moduleClaimsService.getAccountType(authState.tokens.accessToken);
  }, [authState.tokens?.accessToken]);

  const value: AuthContextType = {
    status: authState.status,
    user: authState.user,
    tokens: authState.tokens,
    portalVersion,
    moduleClaims,
    accountType,
    login,
    logout,
    sendPasswordlessEmail,
    resendPasswordlessEmail,
    refreshAuth,
    getAccessToken,
  };

  useEffect(() => {
    const unregister = tokenProvider.register(getAccessToken);

    return () => {
      unregister();
    };
  }, [getAccessToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
