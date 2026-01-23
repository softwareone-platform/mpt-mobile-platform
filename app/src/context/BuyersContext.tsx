import { createContext, ReactNode, useContext, useMemo } from 'react';

import { useAccount } from '@/context/AccountContext';
import { useBuyersData } from '@/hooks/queries/userBuyersData';
import type { Buyer } from '@/types/api';

interface BuyersContextValue {
  buyers: Buyer[];
  buyersLoading: boolean;
  buyersFetchingNext: boolean;
  hasMoreBuyers: boolean;
  buyersError: boolean;
  isUnauthorised: boolean;
  fetchBuyers: () => void;
}

const BuyersContext = createContext<BuyersContextValue | undefined>(undefined);

export const BuyersProvider = ({ children }: { children: ReactNode }) => {
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
  } = useBuyersData(userId, currentAccountId);

  const buyers = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  return (
    <BuyersContext.Provider
      value={{
        buyers,
        buyersLoading: isLoading,
        buyersFetchingNext: isFetchingNextPage,
        hasMoreBuyers: !!hasNextPage,
        buyersError: isError,
        isUnauthorised,
        fetchBuyers: fetchNextPage,
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
