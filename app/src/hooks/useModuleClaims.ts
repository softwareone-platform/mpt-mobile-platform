import { useCallback, useMemo } from 'react';

import { moduleClaimsService } from '@/services/moduleClaimsService';
import { ModuleClaims, ModuleName } from '@/types/modules';

export const useModuleClaims = (accessToken: string | null) => {
  const moduleClaims = useMemo((): ModuleClaims | null => {
    if (!accessToken) return null;
    return moduleClaimsService.getModuleClaims(accessToken);
  }, [accessToken]);

  const hasModuleAccess = useCallback(
    (moduleName: ModuleName): boolean => {
      if (!accessToken) return false;
      return moduleClaimsService.hasModuleAccess(accessToken, moduleName);
    },
    [accessToken],
  );

  return {
    moduleClaims,
    hasModuleAccess,
  };
};
