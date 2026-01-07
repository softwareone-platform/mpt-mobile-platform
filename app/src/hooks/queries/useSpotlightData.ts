import { useQuery } from '@tanstack/react-query';

import { SPOTLIGHT_CATEGORY } from '@/constants/spotlight';
import { useAccountApi } from '@/services/accountService';
import { arrangeSpotlightData } from '@/utils/spotlight';
import { useUserData } from './useUserData';

export const useSpotlightData = (userId: string | undefined) => {
  const { data: userData } = useUserData(userId);
  const { getSpotlightData } = useAccountApi();
  const currentAccountId = userData?.currentAccount?.id;

  return useQuery({
    queryKey: ['spotlightData', userId, currentAccountId],
    queryFn: async () => {
      const { data } = await getSpotlightData();
      return arrangeSpotlightData(data, SPOTLIGHT_CATEGORY);
    },
    enabled: !!currentAccountId,
  });
};
