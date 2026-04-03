import { createContext, ReactNode, useContext, useMemo } from 'react';

import { useAccount } from '@/context/AccountContext';
import { useVendorsData } from '@/hooks/queries/useVendorsData';
import type { ListItemFull } from '@/types/api';

interface VendorsContextValue {
  vendors: ListItemFull[];
  isVendorsLoading: boolean;
  isVendorsFetchingNext: boolean;
  hasMoreVendors: boolean;
  isVendorsError: boolean;
  isUnauthorised: boolean;
  fetchVendorsNextPage: () => void;
}

const VendorsContext = createContext<VendorsContextValue | undefined>(undefined);

export const VendorsProvider = ({ children }: { children: ReactNode }) => {
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
  } = useVendorsData(userId, currentAccountId);

  const vendors = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  const value = useMemo(
    () => ({
      vendors,
      isVendorsLoading: isLoading,
      isVendorsFetchingNext: isFetchingNextPage,
      hasMoreVendors: !!hasNextPage,
      isVendorsError: isError,
      isUnauthorised,
      fetchVendorsNextPage: fetchNextPage,
    }),
    [vendors, isLoading, isFetchingNextPage, hasNextPage, isError, isUnauthorised, fetchNextPage],
  );

  return <VendorsContext.Provider value={value}>{children}</VendorsContext.Provider>;
};

export const useVendors = () => {
  const context = useContext(VendorsContext);
  if (!context) {
    throw new Error('useVendors must be used inside VendorsProvider');
  }
  return context;
};
