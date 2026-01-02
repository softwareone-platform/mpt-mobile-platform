import { useQuery } from '@tanstack/react-query';

import { SPOTLIGHT_CATEGORY } from '@/constants/spotlight';
import { useAccountApi } from '@/services/accountService';
import { UserData } from '@/types/api';
import { arrangeSpotlightData } from '@/utils/spotlight';

export const useSpotlightData = (userId: string | undefined, userData: UserData | null) => {
  const { getSpotlightData } = useAccountApi();
  const currentAccountId = userData?.currentAccount?.id;

  return useQuery({
    queryKey: ['spotlightData', userId, currentAccountId],
    queryFn: async () => {
      const { data } = await getSpotlightData();
      return arrangeSpotlightData(data, SPOTLIGHT_CATEGORY);
    },
    enabled: !!userId && !!userData && !!currentAccountId,
  });
};
