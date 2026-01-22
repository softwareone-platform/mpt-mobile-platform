import { createContext, ReactNode, useContext, useMemo } from 'react';

import { useAccount } from '@/context/AccountContext';
import { useInvoicesData } from '@/hooks/queries/useInvoicesData';
import type { Invoice } from '@/types/billing';

interface InvoicesContextValue {
  invoices: Invoice[];
  invoicesLoading: boolean;
  invoicesFetchingNext: boolean;
  hasMoreInvoices: boolean;
  invoicesError: boolean;
  isUnauthorised: boolean;
  fetchInvoices: () => void;
}

const InvoicesContext = createContext<InvoicesContextValue | undefined>(undefined);

export const InvoicesProvider = ({ children }: { children: ReactNode }) => {
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
  } = useInvoicesData(userId, currentAccountId);

  const invoices = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  return (
    <InvoicesContext.Provider
      value={{
        invoices,
        invoicesLoading: isLoading,
        invoicesFetchingNext: isFetchingNextPage,
        hasMoreInvoices: !!hasNextPage,
        invoicesError: isError,
        isUnauthorised,
        fetchInvoices: fetchNextPage,
      }}
    >
      {children}
    </InvoicesContext.Provider>
  );
};

export const useInvoices = () => {
  const context = useContext(InvoicesContext);
  if (!context) {
    throw new Error('useInvoices must be used inside InvoicesProvider');
  }
  return context;
};
