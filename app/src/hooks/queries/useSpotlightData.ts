import { useQuery } from '@tanstack/react-query';

import { SPOTLIGHT_CATEGORY, templateLookup } from '@/constants/spotlight';
import { useAccountApi } from '@/services/accountService';
import { arrangeSpotlightData } from '@/utils/spotlight';

export const useSpotlightData = (
  userId: string | undefined,
  currentAccountId: string | undefined,
) => {
  const { getSpotlightData } = useAccountApi();

  return useQuery({
    queryKey: ['spotlightData', userId, currentAccountId],
    queryFn: async () => {
      const { data } = await getSpotlightData();

      return arrangeSpotlightData(data, SPOTLIGHT_CATEGORY, templateLookup);
    },
    enabled: !!currentAccountId,
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });
};
