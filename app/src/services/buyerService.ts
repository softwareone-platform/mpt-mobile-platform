import { useCallback, useMemo } from 'react';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useApi } from '@/hooks/useApi';
import type { BuyerData } from '@/types/admin';
import type { PaginatedResponse, ListItemFull } from '@/types/api';

export function useBuyerApi() {
  const api = useApi();

  //TODO Administration operations context: Get all buyers across accounts
  const getBuyers = useCallback(
    async (
      accountId: string,
      offset: number = DEFAULT_OFFSET,
      limit: number = DEFAULT_PAGE_SIZE,
    ): Promise<PaginatedResponse<ListItemFull>> => {
      const endpoint =
        `/v1/accounts/buyers` +
        `?select=-*,id,name,status,icon` +
        `&ne(status,%22Deleted%22)` +
        `&order=name` +
        `&offset=${offset}` +
        `&limit=${limit}`;

      return api.get<PaginatedResponse<ListItemFull>>(endpoint);
    },
    [api],
  );

  const getBuyerData = useCallback(
    async (buyerId: string): Promise<BuyerData> => {
      const endpoint =
        `/v1/accounts/buyers/${buyerId}` +
        `?select=audit.created.at,audit.created.by,audit.updated.at,sellers,account,account.groups`;
      return api.get<BuyerData>(endpoint);
    },
    [api],
  );

  return useMemo(
    () => ({
      getBuyers,
      getBuyerData,
    }),
    [getBuyers, getBuyerData],
  );
}
