import { createContext, ReactNode, useContext, useMemo } from 'react';

import { useAccount } from '@/context/AccountContext';
import { useProgramsData } from '@/hooks/queries/useProgramsData';
import type { ListItemNoImageNoSubtitle } from '@/types/api';

interface ProgramContextValue {
  programs: ListItemNoImageNoSubtitle[];
  programsLoading: boolean;
  programsFetchingNext: boolean;
  hasMorePrograms: boolean;
  programsError: boolean;
  isUnauthorised: boolean;
  fetchPrograms: () => void;
}

const ProgramContext = createContext<ProgramContextValue | undefined>(undefined);

export const ProgramProvider = ({ children }: { children: ReactNode }) => {
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
  } = useProgramsData(userId, currentAccountId);

  const programs = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  return (
    <ProgramContext.Provider
      value={{
        programs,
        programsLoading: isLoading,
        programsFetchingNext: isFetchingNextPage,
        hasMorePrograms: !!hasNextPage,
        programsError: isError,
        isUnauthorised,
        fetchPrograms: fetchNextPage,
      }}
    >
      {children}
    </ProgramContext.Provider>
  );
};

export const usePrograms = () => {
  const context = useContext(ProgramContext);
  if (!context) {
    throw new Error('usePrograms must be used inside ProgramProvider');
  }
  return context;
};
