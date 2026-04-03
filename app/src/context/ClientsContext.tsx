import { createContext, ReactNode, useContext, useMemo } from 'react';

import { useAccount } from '@/context/AccountContext';
import { useClientsData } from '@/hooks/queries/useClientsData';
import type { ListItemFull } from '@/types/api';

interface ClientsContextValue {
  clients: ListItemFull[];
  isClientsLoading: boolean;
  isClientsFetchingNext: boolean;
  hasMoreClients: boolean;
  isClientsError: boolean;
  isUnauthorised: boolean;
  fetchClientsNextPage: () => void;
}

const ClientsContext = createContext<ClientsContextValue | undefined>(undefined);

export const ClientsProvider = ({ children }: { children: ReactNode }) => {
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
  } = useClientsData(userId, currentAccountId);

  const clients = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  const value = useMemo(
    () => ({
      clients,
      isClientsLoading: isLoading,
      isClientsFetchingNext: isFetchingNextPage,
      hasMoreClients: !!hasNextPage,
      isClientsError: isError,
      isUnauthorised,
      fetchClientsNextPage: fetchNextPage,
    }),
    [clients, isLoading, isFetchingNextPage, hasNextPage, isError, isUnauthorised, fetchNextPage],
  );

  return <ClientsContext.Provider value={value}>{children}</ClientsContext.Provider>;
};

export const useClients = () => {
  const context = useContext(ClientsContext);
  if (!context) {
    throw new Error('useClients must be used inside ClientsProvider');
  }
  return context;
};
