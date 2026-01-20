import { useCallback, useMemo } from 'react';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useApi } from '@/hooks/useApi';
import type { PaginatedResponse } from '@/shared/types/api';
import type { Order } from '../types';

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

  return useMemo(
    () => ({
      getOrders,
    }),
    [getOrders],
  );
}
