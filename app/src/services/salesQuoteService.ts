import { useCallback, useMemo } from 'react';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useApi } from '@/hooks/useApi';
import type { PaginatedResponse, ListItemNoImageWithExternalIds } from '@/types/api';
import type { SalesQuoteDetails } from '@/types/procurement';

export function useSalesQuoteApi() {
  const api = useApi();

  const getSalesQuotes = useCallback(
    async (
      offset: number = DEFAULT_OFFSET,
      limit: number = DEFAULT_PAGE_SIZE,
      query?: string,
    ): Promise<PaginatedResponse<ListItemNoImageWithExternalIds>> => {
      const defaultQuery = '&order=-audit.created.at';

      const endpoint =
        `/v1/procurement/sales-quotes` +
        `?select=-*,id,externalIds.operations,status` +
        `${query || defaultQuery}` +
        `&offset=${offset}` +
        `&limit=${limit}`;

      return api.get<PaginatedResponse<ListItemNoImageWithExternalIds>>(endpoint);
    },
    [api],
  );

  const getSalesQuoteDetails = useCallback(
    async (salesQuoteId: string): Promise<SalesQuoteDetails> => {
      const endpoint =
        `/v1/procurement/sales-quotes/${salesQuoteId}` +
        `?select=salesOrders,products,vendors,attributes.navision.navisionCountryCode`;

      return api.get<SalesQuoteDetails>(endpoint);
    },
    [api],
  );

  return useMemo(
    () => ({
      getSalesQuotes,
      getSalesQuoteDetails,
    }),
    [getSalesQuotes, getSalesQuoteDetails],
  );
}
