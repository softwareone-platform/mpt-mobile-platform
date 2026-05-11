import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  PropsWithChildren,
} from 'react';

import { AnalyticsEvents } from '@/constants/analytics';
import { ACCOUNT_ID_CLAIM_KEY } from '@/constants/auth';
import { usePortalVersion } from '@/hooks/queries/usePortalVersion';
import { trackEvent } from '@/hooks/useTrackEvent';
import { tokenProvider } from '@/lib/tokenProvider';
import authService, { AuthTokens, User } from '@/services/authService';
import credentialStorageService from '@/services/credentialStorageService';
import { environmentSwitcherService } from '@/services/environmentSwitcherService';
import { logger } from '@/services/loggerService';
import { PortalVersionInfo } from '@/services/portalVersionService';
import { AccountType } from '@/types/common';
import { ModuleClaims } from '@/types/modules';
import { getModuleClaims, getAccountType } from '@/utils/moduleClaims';

export type AuthState = 'loading' | 'unauthenticated' | 'authenticated';

const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_AUTHENTICATED: 'SET_AUTHENTICATED',
  SET_UNAUTHENTICATED: 'SET_UNAUTHENTICATED',
  UPDATE_TOKENS: 'UPDATE_TOKENS',
  SET_ACCOUNT_ID: 'SET_ACCOUNT_ID',
} as const;

interface AuthContextType {
  status: AuthState;
  user: User | null;
  tokens: AuthTokens | null;
  portalVersion: PortalVersionInfo;
  moduleClaims: ModuleClaims | null;
  accountType: AccountType | null;
  accountId: string | null;
  login: (email: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordlessEmail: (email: string) => Promise<void>;
  resendPasswordlessEmail: (email: string) => Promise<void>;
  refreshAuth: () => Promise<AuthTokens | null>;
  getAccessToken: () => Promise<string | null>;
  updateStoredAccountId: (accountId: string) => Promise<void>;
}

type AuthAction =
  | { type: typeof AUTH_ACTIONS.SET_LOADING }
  | {
      type: typeof AUTH_ACTIONS.SET_AUTHENTICATED;
      payload: { user: User; tokens: AuthTokens; accountId: string | null };
    }
  | { type: typeof AUTH_ACTIONS.SET_UNAUTHENTICATED }
  | { type: typeof AUTH_ACTIONS.UPDATE_TOKENS; payload: AuthTokens }
  | { type: typeof AUTH_ACTIONS.SET_ACCOUNT_ID; payload: string };

interface AuthReducerState {
  status: AuthState;
  user: User | null;
  tokens: AuthTokens | null;
  accountId: string | null;
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
        accountId: action.payload.accountId,
      };
    case AUTH_ACTIONS.SET_UNAUTHENTICATED:
      return {
        status: 'unauthenticated',
        user: null,
        tokens: null,
        accountId: null,
      };
    case AUTH_ACTIONS.UPDATE_TOKENS: {
      const updatedUser = authService.getUserFromToken(action.payload.accessToken);
      return {
        ...state,
        user: updatedUser,
        tokens: action.payload,
        // accountId intentionally not updated — SecureStore is the source of truth
      };
    }
    case AUTH_ACTIONS.SET_ACCOUNT_ID:
      return {
        ...state,
        accountId: action.payload,
      };
    default:
      return state;
  }
};

const initialState: AuthReducerState = {
  status: 'loading',
  user: null,
  tokens: null,
  accountId: null,
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

  const setAuthenticated = useCallback(
    (user: User, tokens: AuthTokens, accountId: string | null) => {
      dispatch({
        type: AUTH_ACTIONS.SET_AUTHENTICATED,
        payload: { user, tokens, accountId },
      });
    },
    [],
  );

  const loadStoredAuth = useCallback(async () => {
    try {
      const [{ refreshToken, user }, accountId] = await Promise.all([
        credentialStorageService.loadStoredCredentials(),
        credentialStorageService.loadAccountId(),
      ]);
      if (!refreshToken || !user) {
        await setUnauthenticated();
        return;
      }

      const newTokens = await authService.refreshAccessToken(refreshToken, accountId ?? undefined);
      const newUser = authService.getUserFromToken(newTokens.accessToken);
      const tokenAccountId = newUser[ACCOUNT_ID_CLAIM_KEY] as string | undefined;

      // No stored accountId: first run or fresh install — accept what the backend returns.
      // Stored accountId exists: it is the source of truth, token should match.
      const resolvedAccountId = accountId ?? tokenAccountId ?? null;

      const storageOps: Promise<void>[] = [credentialStorageService.storeTokens(newTokens)];
      if (!accountId && tokenAccountId) {
        storageOps.push(credentialStorageService.storeAccountId(tokenAccountId));
      }
      await Promise.all(storageOps);

      setAuthenticated(newUser, newTokens, resolvedAccountId);
    } catch (error) {
      logger.error('Failed to load stored auth', error, {
        operation: 'loadStoredAuth',
      });
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
      logger.error('Logout API error', error, {
        operation: 'logout',
      });
    } finally {
      await credentialStorageService.clearAllCredentials();
      dispatch({ type: AUTH_ACTIONS.SET_UNAUTHENTICATED });
      trackEvent(AnalyticsEvents.AUTH_LOGOUT);
    }
  }, [authState.tokens?.refreshToken]);

  const refreshAuth = useCallback(async (): Promise<AuthTokens | null> => {
    try {
      if (!authState.tokens?.refreshToken) {
        throw new Error('No refresh token available');
      }

      const accountId = await credentialStorageService.loadAccountId();
      const newTokens = await authService.refreshAccessToken(
        authState.tokens.refreshToken,
        accountId ?? undefined,
      );

      await credentialStorageService.storeTokens(newTokens);

      dispatch({
        type: AUTH_ACTIONS.UPDATE_TOKENS,
        payload: newTokens,
      });

      return newTokens;
    } catch (error) {
      logger.error('Failed to refresh auth', error, {
        operation: 'refreshAuth',
      });
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
      logger.warn('Token is expiring soon, refreshing immediately');
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
      await environmentSwitcherService.switchEnvironmentForEmail(email);
      await authService.sendPasswordlessEmail(email);
      trackEvent(AnalyticsEvents.AUTH_PASSWORDLESS_EMAIL_SENT);
    } catch (error) {
      logger.error('Send passwordless email error', error, {
        operation: 'sendPasswordlessEmail',
      });
      throw error;
    }
  };

  const login = async (email: string, otp: string) => {
    await environmentSwitcherService.switchEnvironmentForEmail(email);

    const tokens = await authService.verifyPasswordlessOtp(email, otp);
    const user = authService.getUserFromToken(tokens.accessToken);
    const accountId = user[ACCOUNT_ID_CLAIM_KEY] as string | undefined;

    const storageOps: Promise<void>[] = [
      credentialStorageService.storeTokens(tokens),
      credentialStorageService.storeUser(user),
    ];
    if (accountId) {
      storageOps.push(credentialStorageService.storeAccountId(accountId));
    }
    await Promise.all(storageOps);

    dispatch({
      type: AUTH_ACTIONS.SET_AUTHENTICATED,
      payload: { user, tokens, accountId: accountId ?? null },
    });

    trackEvent(AnalyticsEvents.AUTH_LOGIN_SUCCESS);
  };

  const updateStoredAccountId = useCallback(async (newAccountId: string): Promise<void> => {
    await credentialStorageService.storeAccountId(newAccountId);
    dispatch({ type: AUTH_ACTIONS.SET_ACCOUNT_ID, payload: newAccountId });
  }, []);

  const resendPasswordlessEmail = async (email: string) => {
    try {
      await authService.resendPasswordlessEmail(email);
      trackEvent(AnalyticsEvents.AUTH_OTP_RESENT);
    } catch (error) {
      logger.error('Resend passwordless email error', error, {
        operation: 'resendPasswordlessEmail',
      });
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
      logger.error('Failed to refresh token for API call', error, {
        operation: 'getAccessToken',
      });
      return null;
    }
  }, [authState.status, authState.tokens, refreshAuth]);

  const moduleClaims = useMemo(() => {
    if (!authState.tokens?.accessToken) return null;
    return getModuleClaims(authState.tokens.accessToken);
  }, [authState.tokens?.accessToken]);

  const accountType = useMemo(() => {
    if (!authState.tokens?.accessToken) return null;
    return getAccountType(authState.tokens.accessToken);
  }, [authState.tokens?.accessToken]);

  const value: AuthContextType = {
    status: authState.status,
    user: authState.user,
    tokens: authState.tokens,
    portalVersion,
    moduleClaims,
    accountType,
    accountId: authState.accountId,
    login,
    logout,
    sendPasswordlessEmail,
    resendPasswordlessEmail,
    refreshAuth,
    getAccessToken,
    updateStoredAccountId,
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
