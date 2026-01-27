import { useCallback } from 'react';

import { useAuth } from '@/context/AuthContext';
import { FeatureFlagKey, featureFlagsService } from '@/services/featureFlagsService';

export const useFeatureFlags = () => {
  const { portalVersion } = useAuth();

  const isEnabled = useCallback(
    (flag: FeatureFlagKey): boolean => {
      return featureFlagsService.isFeatureEnabled(flag, portalVersion);
    },
    [portalVersion],
  );

  return {
    isEnabled,
    portalVersion,
  };
};
