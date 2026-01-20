import { createContext, ReactNode, useContext, useMemo } from 'react';

import { useAccount } from '@/modules/home';
import { useSubscriptionsData } from '../hooks';
import type { Subscription } from '../types';

interface SubscriptionsContextValue {
  subscriptions: Subscription[];
  subscriptionsLoading: boolean;
  subscriptionsFetchingNext: boolean;
  hasMoreSubscriptions: boolean;
  subscriptionsError: boolean;
  isUnauthorised: boolean;
  fetchSubscriptions: () => void;
}

const SubscriptionsContext = createContext<SubscriptionsContextValue | undefined>(undefined);

export const SubscriptionsProvider = ({ children }: { children: ReactNode }) => {
  const { userData } = useAccount();

  const userId = userData?.id;
  const currentAccountId = userData?.currentAccount?.id;

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    isError,
    isUnauthorised,
    fetchNextPage,
  } = useSubscriptionsData(userId, currentAccountId);

  const subscriptions = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  return (
    <SubscriptionsContext.Provider
      value={{
        subscriptions,
        subscriptionsLoading: isLoading,
        subscriptionsFetchingNext: isFetchingNextPage,
        hasMoreSubscriptions: !!hasNextPage,
        subscriptionsError: isError,
        isUnauthorised,
        fetchSubscriptions: fetchNextPage,
      }}
    >
      {children}
    </SubscriptionsContext.Provider>
  );
};

export const useSubscriptions = () => {
  const context = useContext(SubscriptionsContext);
  if (!context) {
    throw new Error('useSubscriptions must be used inside SubscriptionsProvider');
  }
  return context;
};
