import { createContext, ReactNode, useContext, useMemo } from 'react';

import { useAccount } from '@/context/AccountContext';
import { useSubscriptionsData } from '@/hooks/queries/useSubscriptionsData';
import type { ListItemNoImage, DataSource } from '@/types/api';

interface SubscriptionsContextValue {
  subscriptions: ListItemNoImage[];
  subscriptionsLoading: boolean;
  subscriptionsFetchingNext: boolean;
  hasMoreSubscriptions: boolean;
  subscriptionsError: boolean;
  isUnauthorised: boolean;
  fetchSubscriptions: () => void;
  refetchSubscriptions: () => void;
  isSubscriptionsRefetching: boolean;
}

interface SubscriptionProviderProps {
  children: ReactNode;
  query?: string;
  source?: DataSource;
}

const SubscriptionsContext = createContext<SubscriptionsContextValue | undefined>(undefined);

export const SubscriptionsProvider = ({ children, query, source }: SubscriptionProviderProps) => {
  const { userData, currentAccountId } = useAccount();

  const userId = userData?.id;

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    isError,
    isUnauthorised,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useSubscriptionsData(userId, currentAccountId, query, source);

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
        refetchSubscriptions: refetch,
        isSubscriptionsRefetching: isRefetching,
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
