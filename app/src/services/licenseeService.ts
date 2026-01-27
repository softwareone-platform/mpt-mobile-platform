import { useCallback, useMemo } from 'react';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useApi } from '@/hooks/useApi';
import type { PaginatedResponse, ListItemFull } from '@/types/api';

export function useLicenseeApi() {
  const api = useApi();

  const getLicensees = useCallback(
    async (
      accountId: string,
      offset: number = DEFAULT_OFFSET,
      limit: number = DEFAULT_PAGE_SIZE,
    ): Promise<PaginatedResponse<ListItemFull>> => {
      const endpoint =
        `/v1/accounts/licensees` +
        `?select=seller,buyer.status` +
        `&eq(account.id,%22${accountId}%22)` +
        `&order=name` +
        `&offset=${offset}` +
        `&limit=${limit}`;

      return api.get<PaginatedResponse<ListItemFull>>(endpoint);
    },
    [api],
  );

  return useMemo(
    () => ({
      getLicensees,
    }),
    [getLicensees],
  );
}
