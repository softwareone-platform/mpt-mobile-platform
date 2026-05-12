import { createContext, ReactNode, useContext, useMemo } from 'react';

import { useAccount } from '@/context/AccountContext';
import { useJournalsData } from '@/hooks/queries/useJournalsData';
import type { ListItemNoImage } from '@/types/api';

interface JournalsContextValue {
  journals: ListItemNoImage[];
  journalsLoading: boolean;
  journalsFetchingNext: boolean;
  hasMoreJournals: boolean;
  journalsError: boolean;
  isUnauthorised: boolean;
  fetchJournals: () => void;
  refetchJournals: () => void;
  isJournalsRefetching: boolean;
}

const JournalsContext = createContext<JournalsContextValue | undefined>(undefined);

export const JournalsProvider = ({ children }: { children: ReactNode }) => {
  const { userData, currentAccountId } = useAccount();

  const userId = userData?.id;

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
  } = useJournalsData(userId, currentAccountId);

  const journals = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  const value = useMemo(
    () => ({
      journals,
      journalsLoading: isLoading,
      journalsFetchingNext: isFetchingNextPage,
      hasMoreJournals: !!hasNextPage,
      journalsError: isError,
      isUnauthorised,
      fetchJournals: fetchNextPage,
      refetchJournals: refetch,
      isJournalsRefetching: isRefetching,
    }),
    [
      journals,
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

  return <JournalsContext.Provider value={value}>{children}</JournalsContext.Provider>;
};

export const useJournals = () => {
  const context = useContext(JournalsContext);
  if (!context) {
    throw new Error('useJournals must be used inside JournalsProvider');
  }
  return context;
};
