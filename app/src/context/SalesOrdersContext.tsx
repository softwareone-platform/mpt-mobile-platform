import { createContext, ReactNode, useContext, useMemo } from 'react';

import { useAccount } from '@/context/AccountContext';
import { useSalesOrdersData } from '@/hooks/queries/useSalesOrdersData';
import type { ListItemNoImageWithExternalIds } from '@/types/api';

interface SalesOrdersContextValue {
  salesOrders: ListItemNoImageWithExternalIds[];
  salesOrdersLoading: boolean;
  salesOrdersFetchingNext: boolean;
  hasMoreSalesOrders: boolean;
  salesOrdersError: boolean;
  isUnauthorised: boolean;
  fetchSalesOrders: () => void;
  refetchSalesOrders: () => void;
  isSalesOrdersRefetching: boolean;
}

const SalesOrdersContext = createContext<SalesOrdersContextValue | undefined>(undefined);

interface SalesOrderProviderProps {
  children: ReactNode;
  query?: string;
}

export const SalesOrdersProvider = ({ children, query }: SalesOrderProviderProps) => {
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
  } = useSalesOrdersData(userId, currentAccountId, query);

  const salesOrders = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  return (
    <SalesOrdersContext.Provider
      value={{
        salesOrders,
        salesOrdersLoading: isLoading,
        salesOrdersFetchingNext: isFetchingNextPage,
        hasMoreSalesOrders: !!hasNextPage,
        salesOrdersError: isError,
        isUnauthorised,
        fetchSalesOrders: fetchNextPage,
        refetchSalesOrders: refetch,
        isSalesOrdersRefetching: isRefetching,
      }}
    >
      {children}
    </SalesOrdersContext.Provider>
  );
};

export const useSalesOrders = () => {
  const context = useContext(SalesOrdersContext);
  if (!context) {
    throw new Error('useSalesOrders must be used inside SalesOrdersProvider');
  }
  return context;
};
