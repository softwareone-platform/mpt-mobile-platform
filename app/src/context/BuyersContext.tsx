import { createContext, ReactNode, useContext, useMemo } from 'react';

import { useAccount } from '@/context/AccountContext';
import { useBuyersData } from '@/hooks/queries/userBuyersData';
import type { ListItemFull } from '@/types/api';

interface BuyersContextValue {
  buyers: ListItemFull[];
  isBuyersLoading: boolean;
  isBuyersFetchingNext: boolean;
  hasMoreBuyers: boolean;
  isBuyersError: boolean;
  isUnauthorised: boolean;
  fetchBuyersNextPage: () => void;
}

interface BuyerProviderProps {
  children: ReactNode;
  query?: string;
}

const BuyersContext = createContext<BuyersContextValue | undefined>(undefined);

export const BuyersProvider = ({ children, query }: BuyerProviderProps) => {
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
  } = useBuyersData(userId, currentAccountId, query);

  const buyers = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  return (
    <BuyersContext.Provider
      value={{
        buyers,
        isBuyersLoading: isLoading,
        isBuyersFetchingNext: isFetchingNextPage,
        hasMoreBuyers: !!hasNextPage,
        isBuyersError: isError,
        isUnauthorised,
        fetchBuyersNextPage: fetchNextPage,
      }}
    >
      {children}
    </BuyersContext.Provider>
  );
};

export const useBuyers = () => {
  const context = useContext(BuyersContext);
  if (!context) {
    throw new Error('useBuyers must be used inside BuyersProvider');
  }
  return context;
};
