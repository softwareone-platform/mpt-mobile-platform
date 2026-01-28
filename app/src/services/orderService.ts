import { useCallback, useMemo } from 'react';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useApi } from '@/hooks/useApi';
import type { PaginatedResponse } from '@/types/api';
import type { Order, OrderDetails } from '@/types/order';

export function useOrderApi() {
  const api = useApi();

  const getOrders = useCallback(
    async (
      offset: number = DEFAULT_OFFSET,
      limit: number = DEFAULT_PAGE_SIZE,
    ): Promise<PaginatedResponse<Order>> => {
      const endpoint =
        `/v1/commerce/orders` +
        `?select=audit` +
        `&filter(group.buyers)` +
        `&order=-audit.created.at` +
        `&offset=${offset}` +
        `&limit=${limit}`;

      return api.get<PaginatedResponse<Order>>(endpoint);
    },
    [api],
  );

  const getOrderDetails = useCallback(
    async (orderId: string): Promise<OrderDetails> => {
      const endpoint =
        `/v1/commerce/orders/${orderId}` +
        `?select=-agreement.subscriptions,-agreement.parameters,-agreement.lines,` +
        `agreement,subscriptions,assets,listing.priceList,audit,product.settings.splitBilling,` +
        `agreement.subscriptions,lines.item,certificates,lines.price.markupSource,licensee.eligibility`;

      return api.get<OrderDetails>(endpoint);
    },
    [api],
  );

  return useMemo(
    () => ({
      getOrders,
      getOrderDetails,
    }),
    [getOrders, getOrderDetails],
  );
}
