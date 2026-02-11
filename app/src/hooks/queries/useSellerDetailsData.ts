import { useQuery } from '@tanstack/react-query';

import { useSellerApi } from '@/services/sellerService';
import { SellerData } from '@/types/admin';
import { isUnauthorisedError } from '@/utils/apiError';

export const useSellerDetailsData = (
  sellerId: string | undefined,
  currentUserId: string | undefined,
  currentAccountId: string | undefined,
) => {
  const { getSellerData } = useSellerApi();

  const query = useQuery<SellerData, Error>({
    queryKey: ['sellerDetails', sellerId, currentUserId, currentAccountId],
    queryFn: () => {
      if (!sellerId) {
        throw new Error('Seller ID is required');
      }
      return getSellerData(sellerId);
    },
    enabled: !!sellerId && !!currentUserId && !!currentAccountId,
  });

  return {
    ...query,
    isUnauthorised: isUnauthorisedError(query.error),
  };
};
