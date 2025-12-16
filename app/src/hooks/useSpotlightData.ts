import { useQuery } from '@tanstack/react-query';
import { useAccountApi } from '@/services/accountService';
import { arrangeSpotlightData } from '@/utils/spotlight';
import { SPOTLIGHT_CATEGORY } from '@/constants/spotlight';
import { UserData } from '@/types/api';

export const useSpotlightData = (
  userId: string | undefined,
  userData: UserData | null
) => {
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
