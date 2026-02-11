import { useQuery } from '@tanstack/react-query';

import { useBuyerApi } from '@/services/buyerService';
import { BuyerData } from '@/types/admin';
import { isUnauthorisedError } from '@/utils/apiError';

export const useBuyerDetailsData = (
  buyerId: string | undefined,
  currentUserId: string | undefined,
  currentAccountId: string | undefined,
) => {
  const { getBuyerData } = useBuyerApi();

  const query = useQuery<BuyerData, Error>({
    queryKey: ['userDetails', buyerId, currentUserId, currentAccountId],
    queryFn: () => {
      if (!buyerId) {
        throw new Error('User ID is required');
      }
      return getBuyerData(buyerId);
    },
    enabled: !!buyerId && !!currentUserId && !!currentAccountId,
  });

  return {
    ...query,
    isUnauthorised: isUnauthorisedError(query.error),
  };
};
