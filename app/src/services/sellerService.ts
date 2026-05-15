import { useCallback, useMemo } from 'react';
import { logger } from '@/services/loggerService'; //TODO remove
import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useApi } from '@/hooks/useApi';
import type { SellerData } from '@/types/admin';
import type { PaginatedResponse, ListItemFull } from '@/types/api';

export function useSellerApi() {
  const api = useApi();

  const getSellers = useCallback(
    async (
      offset: number = DEFAULT_OFFSET,
      limit: number = DEFAULT_PAGE_SIZE,
      query?: string,
    ): Promise<PaginatedResponse<ListItemFull>> => {
      const defaultQuery = '&order=name';
      const endpoint =
        `/v1/accounts/sellers` +
        `?select=-*,id,name,status,icon` +
        `${query || defaultQuery}` +
        `&offset=${offset}` +
        `&limit=${limit}`;

      return api.get<PaginatedResponse<ListItemFull>>(endpoint);
    },
    [api],
  );

  const getSellersForBuyer = useCallback(
    async (
      buyerId: string,
      offset: number = DEFAULT_OFFSET,
      limit: number = DEFAULT_PAGE_SIZE,
    ): Promise<PaginatedResponse<ListItemFull>> => {

      logger.debug('GetSellersForBuyer', { buyerId });

      const endpoint =
        `/v1/accounts/buyers/${buyerId}` +
        `?select=-*,sellers`;

      const buyer = await api.get<{ sellers: ListItemFull[] }>(endpoint);
      const allSellers = buyer.sellers ?? [];
      const paged = allSellers.slice(offset, offset + limit);

      return {
        $meta: {
          pagination: {
            offset,
            limit,
            total: allSellers.length,
          },
        },
        data: paged,
      };
    },
    [api],
  );

  const getSellerData = useCallback(
    async (sellerId: string): Promise<SellerData> => {
      const endpoint = `/v1/accounts/sellers/${sellerId}?select=audit.created.at,audit.created.by,audit.updated.at,audit.updated.by`;
      return api.get<SellerData>(endpoint);
    },
    [api],
  );

  return useMemo(
    () => ({
      getSellers,
      getSellerData,
      getSellersForBuyer,
    }),
    [getSellers, getSellerData, getSellersForBuyer],
  );
}
