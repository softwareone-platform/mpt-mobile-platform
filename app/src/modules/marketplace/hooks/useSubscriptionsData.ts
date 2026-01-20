import { usePaginatedQuery } from '@/shared/hooks/usePaginatedQuery';
import { useSubscriptionApi } from '../services';
import type { Subscription } from '../types';

export const useSubscriptionsData = (
  userId: string | undefined,
  currentAccountId: string | undefined,
) => {
  const { getSubscriptions } = useSubscriptionApi();

  return usePaginatedQuery<Subscription>({
    queryKey: ['subscriptions', userId, currentAccountId],
    queryFn: getSubscriptions,
    enabled: !!userId && !!currentAccountId,
  });
};
