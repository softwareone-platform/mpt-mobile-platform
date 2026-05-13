import { createContext, ReactNode, useContext, useMemo } from 'react';

import { useAccount } from '@/context/AccountContext';
import { useSellersData } from '@/hooks/queries/useSellersData';
import type { ListItemFull, DataSource } from '@/types/api';

interface SellersContextValue {
  sellers: ListItemFull[];
  sellersLoading: boolean;
  sellersFetchingNext: boolean;
  hasMoreSellers: boolean;
  sellersError: boolean;
  isUnauthorised: boolean;
  fetchSellers: () => void;
  refetchSellers: () => void;
  isSellersRefetching: boolean;
}

interface SellersProviderProps {
  children: ReactNode;
  source?: DataSource;
}

const SellersContext = createContext<SellersContextValue | undefined>(undefined);

export const SellersProvider = ({ children, source }: SellersProviderProps) => {
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
    refetch,
    isRefetching,
  } = useSellersData(userId, currentAccountId, source);

  const sellers = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  return (
    <SellersContext.Provider
      value={{
        sellers,
        sellersLoading: isLoading,
        sellersFetchingNext: isFetchingNextPage,
        hasMoreSellers: !!hasNextPage,
        sellersError: isError,
        isUnauthorised,
        fetchSellers: fetchNextPage,
        refetchSellers: refetch,
        isSellersRefetching: isRefetching,
      }}
    >
      {children}
    </SellersContext.Provider>
  );
};

export const useSellers = () => {
  const context = useContext(SellersContext);
  if (!context) {
    throw new Error('useSellers must be used inside SellersProvider');
  }
  return context;
};
