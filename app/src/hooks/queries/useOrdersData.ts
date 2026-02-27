import { usePaginatedQuery } from '@/hooks/queries/usePaginatedQuery';
import { useOrderApi } from '@/services/orderService';
import type { ListItemNoImageNoSubtitle } from '@/types/api';

export const useOrdersData = (
  userId: string | undefined,
  currentAccountId: string | undefined,
  query?: string,
) => {
  const { getOrders } = useOrderApi();

  return usePaginatedQuery<ListItemNoImageNoSubtitle>({
    queryKey: ['orders', userId, currentAccountId, query],
    queryFn: (offset, limit) => getOrders(offset, limit, query),
    enabled: !!userId && !!currentAccountId,
  });
};
