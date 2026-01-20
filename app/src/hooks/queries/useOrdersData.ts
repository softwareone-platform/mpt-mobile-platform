import { usePaginatedQuery } from '@/hooks/queries/usePaginatedQuery';
import { useOrderApi } from '@/services/orderService';
import type { Order } from '@/types/order';

export const useOrdersData = (userId: string | undefined, currentAccountId: string | undefined) => {
  const { getOrders } = useOrderApi();

  return usePaginatedQuery<Order>({
    queryKey: ['orders', userId, currentAccountId],
    queryFn: getOrders,
    enabled: !!userId && !!currentAccountId,
  });
};
