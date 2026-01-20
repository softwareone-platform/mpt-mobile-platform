import { useQuery } from '@tanstack/react-query';

import { useUserData } from './useUserData';

import { SPOTLIGHT_CATEGORY } from '@/constants/spotlight';
import { useAccountApi } from '../services';
import { arrangeSpotlightData } from '@/utils/spotlight';

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
