import { createContext, ReactNode, useContext, useMemo } from 'react';

import { useAccount } from '@/context/AccountContext';
import { useStatementsData } from '@/hooks/queries/useStatementsData';
import type { ListItemNoImageNoSubtitle } from '@/types/api';

interface StatementsContextValue {
  statements: ListItemNoImageNoSubtitle[];
  statementsLoading: boolean;
  statementsFetchingNext: boolean;
  hasMoreStatements: boolean;
  statementsError: boolean;
  isUnauthorised: boolean;
  fetchStatements: () => void;
  refetchStatements: () => void;
  isStatementsRefetching: boolean;
}

interface StatementProviderProps {
  children: ReactNode;
  query?: string;
}

const StatementsContext = createContext<StatementsContextValue | undefined>(undefined);

export const StatementsProvider = ({ children, query }: StatementProviderProps) => {
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
  } = useStatementsData(userId, currentAccountId, query);

  const statements = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  return (
    <StatementsContext.Provider
      value={{
        statements,
        statementsLoading: isLoading,
        statementsFetchingNext: isFetchingNextPage,
        hasMoreStatements: !!hasNextPage,
        statementsError: isError,
        isUnauthorised,
        fetchStatements: fetchNextPage,
        refetchStatements: refetch,
        isStatementsRefetching: isRefetching,
      }}
    >
      {children}
    </StatementsContext.Provider>
  );
};

export const useStatements = () => {
  const context = useContext(StatementsContext);
  if (!context) {
    throw new Error('useStatements must be used inside StatementsProvider');
  }
  return context;
};
