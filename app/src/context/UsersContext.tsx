import { createContext, ReactNode, useContext, useMemo } from 'react';

import { useAccount } from '@/context/AccountContext';
import { useUsersData } from '@/hooks/queries/useUsersData';
import type { ListItemFull } from '@/types/api';

interface UsersContextValue {
  users: ListItemFull[];
  usersLoading: boolean;
  usersFetchingNext: boolean;
  hasMoreUsers: boolean;
  usersError: boolean;
  isUnauthorised: boolean;
  fetchUsers: () => void;
}

const UsersContext = createContext<UsersContextValue | undefined>(undefined);

export const UsersProvider = ({ children }: { children: ReactNode }) => {
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
  } = useUsersData(userId, currentAccountId);

  const users = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  return (
    <UsersContext.Provider
      value={{
        users,
        usersLoading: isLoading,
        usersFetchingNext: isFetchingNextPage,
        hasMoreUsers: !!hasNextPage,
        usersError: isError,
        isUnauthorised,
        fetchUsers: fetchNextPage,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = () => {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error('useUsers must be used inside UsersProvider');
  }
  return context;
};
