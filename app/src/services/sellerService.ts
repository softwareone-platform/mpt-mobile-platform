import { useCallback, useMemo } from 'react';

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
    ): Promise<PaginatedResponse<ListItemFull>> => {
      const endpoint =
        `/v1/accounts/sellers` +
        `?select=id,name,status,icon` +
        '&order=name' +
        `&offset=${offset}` +
        `&limit=${limit}`;

      return api.get<PaginatedResponse<ListItemFull>>(endpoint);
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
    }),
    [getSellers, getSellerData],
  );
}
