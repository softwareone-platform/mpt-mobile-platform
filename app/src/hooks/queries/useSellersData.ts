import { usePaginatedQuery } from '@/hooks/queries/usePaginatedQuery';
import { useSellerApi } from '@/services/sellerService';
import type { ListItemFull, DataSource } from '@/types/api';

export const useSellersData = (
  userId: string | undefined,
  currentAccountId: string | undefined,
  source?: DataSource,
) => {
  const { getSellers, getSellersForBuyer } = useSellerApi();

  return usePaginatedQuery<ListItemFull>({
    queryKey: ['sellers', userId, currentAccountId, source],
    queryFn: (offset, limit) => {
      switch (source?.type) {
        case 'buyer':
          return getSellersForBuyer(source.id, offset, limit);

        default:
          return getSellers(offset, limit);
      }
    },
    enabled: !!userId && !!currentAccountId,
  });
};
