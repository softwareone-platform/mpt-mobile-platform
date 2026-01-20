import { usePaginatedQuery } from '@/shared/hooks/usePaginatedQuery';
import { useOrderApi } from '../services';
import type { Order } from '../types';

export const useOrdersData = (userId: string | undefined, currentAccountId: string | undefined) => {
  const { getOrders } = useOrderApi();

  return usePaginatedQuery<Order>({
    queryKey: ['orders', userId, currentAccountId],
    queryFn: getOrders,
    enabled: !!userId && !!currentAccountId,
  });
};
