import { useEffect, useMemo } from 'react';

import { useAuth } from '@/context/AuthContext';
import { FeatureFlagKey, featureFlagsService } from '@/services/featureFlagsService';

export const useFeatureFlags = () => {
  const { portalVersion } = useAuth();

  useEffect(() => {
    featureFlagsService.setPortalVersion(portalVersion);
  }, [portalVersion]);

  const isEnabled = useMemo(() => {
    return (flag: FeatureFlagKey): boolean => {
      return featureFlagsService.isFeatureEnabled(flag);
    };
  }, []);

  return {
    isEnabled,
    portalVersion,
  };
};
