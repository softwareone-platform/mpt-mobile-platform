import { useCallback, useMemo } from 'react';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useApi } from '@/hooks/useApi';
import type { PaginatedResponse, ListItemNoImage } from '@/types/api';
import type { SubscriptionData } from '@/types/subscription';

export function useSubscriptionApi() {
  const api = useApi();

  const getSubscriptions = useCallback(
    async (
      offset: number = DEFAULT_OFFSET,
      limit: number = DEFAULT_PAGE_SIZE,
      query?: string,
    ): Promise<PaginatedResponse<ListItemNoImage>> => {
      const defaultQuery = '&filter(group.buyers)';

      const endpoint =
        `/v1/commerce/subscriptions` +
        `?select=-*,id,name,status` +
        `${query || defaultQuery}` +
        `&offset=${offset}` +
        `&limit=${limit}`;

      return api.get<PaginatedResponse<ListItemNoImage>>(endpoint);
    },
    [api],
  );

  const getSubscriptionData = useCallback(
    async (subscriptionId: string): Promise<SubscriptionData> => {
      const endpoint =
        `/v1/commerce/subscriptions/${subscriptionId}` +
        `?select=-agreement.subscriptions,-agreement.parameters,-agreement.lines,agreement,` +
        `lines,lines.item.terms,lines.item.unit,lines.item.quantityNotApplicable,` +
        `agreement.listing.priceList,licensee,buyer,seller,audit,split.allocations,` +
        `product.settings.splitBilling,product.settings.subscriptionCessation`;
      return api.get<SubscriptionData>(endpoint);
    },
    [api],
  );

  return useMemo(
    () => ({
      getSubscriptions,
      getSubscriptionData,
    }),
    [getSubscriptions, getSubscriptionData],
  );
}
