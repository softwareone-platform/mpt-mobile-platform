jest.mock('@/services/appInsightsService', () => ({
  appInsightsService: {
    initialize: jest.fn(),
    setUserProvider: jest.fn(),
    trackEvent: jest.fn(),
    trackTrace: jest.fn(),
  },
}));

jest.mock('@/services/loggerService', () => ({
  logger: {
    info: jest.fn(),
    trace: jest.fn(),
  },
}));

const mockUser = {
  sub: 'auth0|123',
  [USER_ID_CLAIM_KEY]: 'USR-1234-5678',
  [ACCOUNT_ID_CLAIM_KEY]: 'ACC-9876-5432',
};

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
  }),
}));

import { renderHook } from '@testing-library/react-native';

import { ACCOUNT_ID_CLAIM_KEY, USER_ID_CLAIM_KEY } from '@/constants/auth';
import { useAppInsights } from '@/hooks/useAppInsights';
import { appInsightsService } from '@/services/appInsightsService';
import { logger } from '@/services/loggerService';

describe('useAppInsights', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize Application Insights on mount', () => {
    renderHook(() => useAppInsights());
    expect(appInsightsService.initialize).toHaveBeenCalled();
  });

  it('should set user provider', () => {
    renderHook(() => useAppInsights());
    expect(appInsightsService.setUserProvider).toHaveBeenCalled();
  });

  it('should track app mounted event', () => {
    renderHook(() => useAppInsights());
    expect(appInsightsService.trackEvent).toHaveBeenCalledWith({
      name: 'MPT_Mobile_App_Mounted',
      properties: expect.objectContaining({
        source: 'useAppInsights',
      }),
    });
    expect(logger.info).toHaveBeenCalledWith('App mounted, telemetry event sent');
  });

  it('should track user context update when user exists', () => {
    renderHook(() => useAppInsights());
    expect(logger.trace).toHaveBeenCalledWith(
      'User context updated',
      expect.objectContaining({
        action: 'UserUpdated',
      }),
    );
  });

  it('should return appInsightsService instance', () => {
    const { result } = renderHook(() => useAppInsights());
    expect(result.current).toBe(appInsightsService);
  });
});
