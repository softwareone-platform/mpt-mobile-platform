import { createContext, ReactNode, useContext, useMemo } from 'react';

import { useAccount } from '@/context/AccountContext';
import { useSalesQuotesData } from '@/hooks/queries/useSalesQuotesData';
import type { ListItemNoImageWithExternalIds } from '@/types/api';

interface SalesQuotesContextValue {
  salesQuotes: ListItemNoImageWithExternalIds[];
  salesQuotesLoading: boolean;
  salesQuotesFetchingNext: boolean;
  hasMoreSalesQuotes: boolean;
  salesQuotesError: boolean;
  isUnauthorised: boolean;
  fetchSalesQuotes: () => void;
  refetchSalesQuotes: () => void;
  isSalesQuotesRefetching: boolean;
}

const SalesQuotesContext = createContext<SalesQuotesContextValue | undefined>(undefined);

interface SalesQuoteProviderProps {
  children: ReactNode;
  query?: string;
}

export const SalesQuotesProvider = ({ children, query }: SalesQuoteProviderProps) => {
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
  } = useSalesQuotesData(userId, currentAccountId, query);

  const salesQuotes = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  return (
    <SalesQuotesContext.Provider
      value={{
        salesQuotes,
        salesQuotesLoading: isLoading,
        salesQuotesFetchingNext: isFetchingNextPage,
        hasMoreSalesQuotes: !!hasNextPage,
        salesQuotesError: isError,
        isUnauthorised,
        fetchSalesQuotes: fetchNextPage,
        refetchSalesQuotes: refetch,
        isSalesQuotesRefetching: isRefetching,
      }}
    >
      {children}
    </SalesQuotesContext.Provider>
  );
};

export const useSalesQuotes = () => {
  const context = useContext(SalesQuotesContext);
  if (!context) {
    throw new Error('useSalesQuotes must be used inside SalesQuotesProvider');
  }
  return context;
};
