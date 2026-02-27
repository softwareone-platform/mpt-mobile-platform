import { createContext, ReactNode, useContext, useMemo } from 'react';

import { useAccount } from '@/context/AccountContext';
import { useSubscriptionsData } from '@/hooks/queries/useSubscriptionsData';
import type { ListItemNoImage } from '@/types/api';

interface SubscriptionsContextValue {
  subscriptions: ListItemNoImage[];
  subscriptionsLoading: boolean;
  subscriptionsFetchingNext: boolean;
  hasMoreSubscriptions: boolean;
  subscriptionsError: boolean;
  isUnauthorised: boolean;
  fetchSubscriptions: () => void;
}

interface SubscriptionProviderProps {
  children: ReactNode;
  query?: string;
}

const SubscriptionsContext = createContext<SubscriptionsContextValue | undefined>(undefined);

export const SubscriptionsProvider = ({ children, query }: SubscriptionProviderProps) => {
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
  } = useSubscriptionsData(userId, currentAccountId, query);

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
