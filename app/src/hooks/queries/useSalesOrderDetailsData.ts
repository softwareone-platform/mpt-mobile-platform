import { useQuery } from '@tanstack/react-query';

import { useSalesOrderApi } from '@/services/salesOrderService';
import type { SalesOrderDetails } from '@/types/procurement';
import { isUnauthorisedError } from '@/utils/apiError';

export const useSalesOrderDetailsData = (
  salesOrderId: string | undefined,
  userId: string | undefined,
  currentAccountId: string | undefined,
) => {
  const { getSalesOrderDetails } = useSalesOrderApi();

  const query = useQuery<SalesOrderDetails, Error>({
    queryKey: ['salesOrderDetails', salesOrderId, userId, currentAccountId],
    queryFn: () => {
      if (!salesOrderId) {
        throw new Error('Order ID is required');
      }
      return getSalesOrderDetails(salesOrderId);
    },
    enabled: !!salesOrderId && !!userId && !!currentAccountId,
  });

  return {
    ...query,
    isUnauthorised: isUnauthorisedError(query.error),
  };
};
