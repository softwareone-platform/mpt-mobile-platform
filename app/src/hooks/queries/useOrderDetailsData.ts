import { useQuery } from '@tanstack/react-query';

import { useOrderApi } from '@/services/orderService';
import type { OrderDetails } from '@/types/order';
import { isUnauthorisedError } from '@/utils/apiError';

export const useOrderDetailsData = (
  orderId: string | undefined,
  userId: string | undefined,
  currentAccountId: string | undefined,
) => {
  const { getOrderDetails } = useOrderApi();

  const query = useQuery<OrderDetails, Error>({
    queryKey: ['orderDetails', orderId, userId, currentAccountId],
    queryFn: () => {
      if (!orderId) {
        throw new Error('Order ID is required');
      }
      return getOrderDetails(orderId);
    },
    enabled: !!orderId && !!userId && !!currentAccountId,
  });

  return {
    ...query,
    isUnauthorised: isUnauthorisedError(query.error),
  };
};
