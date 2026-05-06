import { usePaginatedQuery } from '@/hooks/queries/usePaginatedQuery';
import { useSellerApi } from '@/services/sellerService';
import type { ListItemFull } from '@/types/api';

export const useSellersData = (
  userId: string | undefined,
  currentAccountId: string | undefined,
) => {
  const { getSellers } = useSellerApi();

  return usePaginatedQuery<ListItemFull>({
    queryKey: ['sellers', userId, currentAccountId],
    queryFn: (offset, limit) => getSellers(offset, limit),
    enabled: !!userId && !!currentAccountId,
  });
};
