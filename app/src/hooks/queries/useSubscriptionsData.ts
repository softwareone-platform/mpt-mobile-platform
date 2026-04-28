import { usePaginatedQuery } from '@/hooks/queries/usePaginatedQuery';
import { useSubscriptionApi } from '@/services/subscriptionService';
import type { ListItemNoImage, DataSource } from '@/types/api';

export const useSubscriptionsData = (
  userId: string | undefined,
  currentAccountId: string | undefined,
  query?: string,
  source?: DataSource,
) => {
  const { getSubscriptions, getSubscriptionsForOrder } = useSubscriptionApi();

  return usePaginatedQuery<ListItemNoImage>({
    queryKey: ['subscriptions', userId, currentAccountId, query, source],
    queryFn: (offset, limit) => {
      switch (source?.type) {
        case 'order':
          return getSubscriptionsForOrder(source.id, offset, limit);

        default:
          return getSubscriptions(offset, limit, query);
      }
    },
    enabled: !!userId && !!currentAccountId,
  });
};
