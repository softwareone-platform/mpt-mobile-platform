import { renderHook } from '@testing-library/react-native';

import { useAppInsights } from '@/hooks/useAppInsights';
import { appInsightsService } from '@/services/appInsightsService';

const mockInitialize = jest.fn();
const mockSetUserProvider = jest.fn();
const mockTrackEvent = jest.fn();
const mockTrackTrace = jest.fn();

jest.mock('@/services/appInsightsService', () => ({
  appInsightsService: {
    initialize: mockInitialize,
    setUserProvider: mockSetUserProvider,
    trackEvent: mockTrackEvent,
    trackTrace: mockTrackTrace,
  },
}));

const mockUser = {
  sub: 'auth0|123',
  'https://claims.softwareone.com/userId': 'USR-1234-5678',
  'https://claims.softwareone.com/accountId': 'ACC-9876-5432',
};

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
  }),
}));

describe('useAppInsights', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize Application Insights on mount', () => {
    renderHook(() => useAppInsights());
    expect(mockInitialize).toHaveBeenCalled();
  });

  it('should set user provider', () => {
    renderHook(() => useAppInsights());
    expect(mockSetUserProvider).toHaveBeenCalled();
  });

  it('should track app mounted event', () => {
    renderHook(() => useAppInsights());
    expect(mockTrackEvent).toHaveBeenCalledWith({
      name: 'MPT_Mobile_App_Mounted',
      properties: expect.objectContaining({
        source: 'useAppInsights',
      }),
    });
  });

  it('should track user context update', () => {
    renderHook(() => useAppInsights());
    expect(mockTrackTrace).toHaveBeenCalledWith(
      'User context updated',
      'Information',
      expect.objectContaining({
        component: 'App',
        action: 'UserUpdated',
      }),
    );
  });

  it('should return appInsightsService instance', () => {
    const { result } = renderHook(() => useAppInsights());
    expect(result.current).toBe(appInsightsService);
  });
});
