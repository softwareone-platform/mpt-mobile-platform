import { usePaginatedQuery } from '@/hooks/queries/usePaginatedQuery';
import { useSalesOrderApi } from '@/services/salesOrderService';
import type { ListItemNoImageWithExternalIds } from '@/types/api';

export const useSalesOrdersData = (
  userId: string | undefined,
  currentAccountId: string | undefined,
  query?: string,
) => {
  const { getSalesOrders } = useSalesOrderApi();

  return usePaginatedQuery<ListItemNoImageWithExternalIds>({
    queryKey: ['salesOrders', userId, currentAccountId, query],
    queryFn: (offset, limit) => getSalesOrders(offset, limit, query),
    enabled: !!userId && !!currentAccountId,
  });
};
