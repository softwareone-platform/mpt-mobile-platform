import { createContext, ReactNode, useContext, useMemo } from 'react';

import { useUserAccountsData } from '@/hooks/queries/useUserAccountsData';
import type { UserAccount } from '@/types/api';

interface UserAccountsContextValue {
  accounts: UserAccount[];
  isLoading: boolean;
  isFetchingNext: boolean;
  hasMore: boolean;
  isError: boolean;
  isUnauthorised: boolean;
  fetchNextPage: () => void;
  refetch: () => void;
  isRefetching: boolean;
}

const UserAccountsContext = createContext<UserAccountsContextValue | undefined>(undefined);

interface UserAccountsProviderProps {
  children: ReactNode;
  userId?: string;
}

export const UserAccountsProvider = ({ children, userId }: UserAccountsProviderProps) => {
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
  } = useUserAccountsData(userId);

  const accounts = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  const value = useMemo(
    () => ({
      accounts,
      isLoading,
      isFetchingNext: isFetchingNextPage,
      hasMore: !!hasNextPage,
      isError,
      isUnauthorised,
      fetchNextPage,
      refetch,
      isRefetching,
    }),
    [
      accounts,
      isLoading,
      isFetchingNextPage,
      hasNextPage,
      isError,
      isUnauthorised,
      fetchNextPage,
      refetch,
      isRefetching,
    ],
  );

  return <UserAccountsContext.Provider value={value}>{children}</UserAccountsContext.Provider>;
};

export const useUserAccounts = () => {
  const context = useContext(UserAccountsContext);
  if (!context) {
    throw new Error('useUserAccounts must be used inside UserAccountsProvider');
  }
  return context;
};
