import { usePaginatedQuery } from '@/hooks/queries/usePaginatedQuery';
import { useBuyerApi } from '@/services/buyerService';
import type { Buyer } from '@/types/api';

export const useBuyersData = (userId: string | undefined, currentAccountId: string | undefined) => {
  const { getBuyers } = useBuyerApi();

  return usePaginatedQuery<Buyer>({
    queryKey: ['buyers', userId, currentAccountId],
    queryFn: (offset, limit) => getBuyers(currentAccountId!, offset, limit),
    enabled: !!userId && !!currentAccountId,
  });
};
