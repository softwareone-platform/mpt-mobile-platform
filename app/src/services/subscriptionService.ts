import { useCallback, useMemo } from 'react';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useApi } from '@/hooks/useApi';
import type { PaginatedResponse } from '@/types/api';
import type { Subscription } from '@/types/subscription';

export function useSubscriptionApi() {
  const api = useApi();

  const getSubscriptions = useCallback(
    async (
      offset: number = DEFAULT_OFFSET,
      limit: number = DEFAULT_PAGE_SIZE,
    ): Promise<PaginatedResponse<Subscription>> => {
      const endpoint =
        `/v1/commerce/subscriptions` +
        `?select=agreement,agreement.listing.priceList,audit.created,audit.updated,seller.address` +
        `&filter(group.buyers)` +
        `&offset=${offset}` +
        `&limit=${limit}`;

      return api.get<PaginatedResponse<Subscription>>(endpoint);
    },
    [api],
  );

  return useMemo(
    () => ({
      getSubscriptions,
    }),
    [getSubscriptions],
  );
}
