import { useCallback, useMemo } from 'react';

import { ModuleClaims, ModuleName } from '@/types/modules';
import { getModuleClaims, hasModuleAccess as checkModuleAccess } from '@/utils/moduleClaims';

export const useModuleClaims = (accessToken: string | null) => {
  const moduleClaims = useMemo((): ModuleClaims | null => {
    if (!accessToken) return null;
    return getModuleClaims(accessToken);
  }, [accessToken]);

  const hasModuleAccess = useCallback(
    (moduleName: ModuleName): boolean => {
      if (!accessToken) return false;
      return checkModuleAccess(accessToken, moduleName);
    },
    [accessToken],
  );

  return {
    moduleClaims,
    hasModuleAccess,
  };
};
