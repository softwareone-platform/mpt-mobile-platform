import { usePaginatedQuery } from '@/hooks/queries/usePaginatedQuery';
import { useBuyerApi } from '@/services/buyerService';
import type { ListItemFull } from '@/types/api';

export const useBuyersData = (
  userId: string | undefined,
  currentAccountId: string | undefined,
  query?: string,
) => {
  const { getBuyers } = useBuyerApi();

  return usePaginatedQuery<ListItemFull>({
    queryKey: ['buyers', userId, currentAccountId, query],
    queryFn: (offset, limit) => getBuyers(currentAccountId!, offset, limit, query),
    enabled: !!userId && !!currentAccountId,
  });
};
