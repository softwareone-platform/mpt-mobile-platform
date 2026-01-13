import { createContext, ReactNode, useContext, useMemo } from 'react';

import { useAccount } from '@/context/AccountContext';
import { useCreditMemosData } from '@/hooks/queries/useCreditMemosData';
import type { CreditMemo } from '@/types/billing';

interface BillingContextValue {
  creditMemos: CreditMemo[];
  creditMemosLoading: boolean;
  creditMemosFetchingNext: boolean;
  hasMoreCreditMemos: boolean;
  fetchCreditMemos: () => void;
}

const BillingContext = createContext<BillingContextValue | undefined>(undefined);

export const BillingProvider = ({ children }: { children: ReactNode }) => {
  const { userData } = useAccount();

  const userId = userData?.id;
  const currentAccountId = userData?.currentAccount?.id;

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useCreditMemosData(
    userId,
    currentAccountId,
  );

  const creditMemos = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  return (
    <BillingContext.Provider
      value={{
        creditMemos,
        creditMemosLoading: isLoading,
        creditMemosFetchingNext: isFetchingNextPage,
        hasMoreCreditMemos: !!hasNextPage,
        fetchCreditMemos: fetchNextPage,
      }}
    >
      {children}
    </BillingContext.Provider>
  );
};

export const useBilling = () => {
  const context = useContext(BillingContext);
  if (!context) {
    throw new Error('useBilling must be used inside BillingProvider');
  }
  return context;
};
