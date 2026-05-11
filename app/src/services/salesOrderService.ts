import { useCallback, useMemo } from 'react';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useApi } from '@/hooks/useApi';
import type { PaginatedResponse, ListItemNoImageWithExternalIds } from '@/types/api';
import type { SalesOrderDetails } from '@/types/procurement';

export function useSalesOrderApi() {
  const api = useApi();

  const getSalesOrders = useCallback(
    async (
      offset: number = DEFAULT_OFFSET,
      limit: number = DEFAULT_PAGE_SIZE,
      query?: string,
    ): Promise<PaginatedResponse<ListItemNoImageWithExternalIds>> => {
      const defaultQuery = '&order=-audit.created.at';

      const endpoint =
        `/v1/procurement/sales-orders` +
        `?select=-*,id,externalIds.operations,status` +
        `${query || defaultQuery}` +
        `&offset=${offset}` +
        `&limit=${limit}`;

      return api.get<PaginatedResponse<ListItemNoImageWithExternalIds>>(endpoint);
    },
    [api],
  );

  const getSalesOrderDetails = useCallback(
    async (salesOrderId: string): Promise<SalesOrderDetails> => {
      const endpoint = `/v1/procurement/sales-orders/${salesOrderId}?select=vendors,products`;

      return api.get<SalesOrderDetails>(endpoint);
    },
    [api],
  );

  return useMemo(
    () => ({
      getSalesOrders,
      getSalesOrderDetails,
    }),
    [getSalesOrders, getSalesOrderDetails],
  );
}
