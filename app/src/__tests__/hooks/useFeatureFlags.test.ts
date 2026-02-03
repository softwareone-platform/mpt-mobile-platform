import { renderHook } from '@testing-library/react-native';

jest.mock('@/services/appInsightsService', () => ({
  appInsightsService: {
    trackException: jest.fn(),
  },
}));

import * as AuthContext from '@/context/AuthContext';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { PortalVersionInfo } from '@/services/portalVersionService';

jest.mock('@/context/AuthContext');

describe('useFeatureFlags', () => {
  const mockUseAuth = AuthContext.useAuth as jest.MockedFunction<typeof AuthContext.useAuth>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns isEnabled function that checks version requirements', () => {
    const portalVersion: PortalVersionInfo = { fullVersion: '5.0.0', majorVersion: 5 };
    mockUseAuth.mockReturnValue({ portalVersion } as ReturnType<typeof AuthContext.useAuth>);

    const { result } = renderHook(() => useFeatureFlags());

    expect(result.current.isEnabled('FEATURE_ACCOUNT_TABS')).toBe(true);
  });
});
