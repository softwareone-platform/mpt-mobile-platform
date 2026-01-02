import { useQuery } from '@tanstack/react-query';

import { fetchPortalVersion } from '@/services/portalVersionService';

export const usePortalVersion = (enabled: boolean) => {
  return useQuery({
    queryKey: ['portalVersion'],
    queryFn: fetchPortalVersion,
    enabled,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};
