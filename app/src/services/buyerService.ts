import { useCallback, useMemo } from 'react';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useApi } from '@/hooks/useApi';
import type { PaginatedResponse, Buyer } from '@/types/api';

export function useBuyerApi() {
  const api = useApi();

  const getBuyers = useCallback(
    async (
      accountId: string,
      offset: number = DEFAULT_OFFSET,
      limit: number = DEFAULT_PAGE_SIZE,
    ): Promise<PaginatedResponse<Buyer>> => {
      const endpoint =
        `/v1/accounts/buyers` +
        `?select=sellers,audit.created.at,audit.updated.at,sellers.erpLink.status` +
        `&ne(status,%22Deleted%22)` +
        `&order=name` +
        `&offset=${offset}` +
        `&limit=${limit}`;

      return api.get<PaginatedResponse<Buyer>>(endpoint);
    },
    [api],
  );

  return useMemo(
    () => ({
      getBuyers,
    }),
    [getBuyers],
  );
}
