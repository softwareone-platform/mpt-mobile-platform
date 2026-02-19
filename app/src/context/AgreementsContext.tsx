import { createContext, ReactNode, useContext, useMemo } from 'react';

import { useAccount } from '@/context/AccountContext';
import { useAgreementsData } from '@/hooks/queries/useAgreementsData';
import type { ListItemNoImage } from '@/types/api';

interface AgreementsContextValue {
  agreements: ListItemNoImage[];
  agreementsLoading: boolean;
  agreementsFetchingNext: boolean;
  hasMoreAgreements: boolean;
  agreementsError: boolean;
  isUnauthorised: boolean;
  fetchAgreements: () => void;
}

const AgreementsContext = createContext<AgreementsContextValue | undefined>(undefined);

export const AgreementsProvider = ({ children }: { children: ReactNode }) => {
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
  } = useAgreementsData(userId, currentAccountId);

  const agreements = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  return (
    <AgreementsContext.Provider
      value={{
        agreements,
        agreementsLoading: isLoading,
        agreementsFetchingNext: isFetchingNextPage,
        hasMoreAgreements: !!hasNextPage,
        agreementsError: isError,
        isUnauthorised,
        fetchAgreements: fetchNextPage,
      }}
    >
      {children}
    </AgreementsContext.Provider>
  );
};

export const useAgreements = () => {
  const context = useContext(AgreementsContext);
  if (!context) {
    throw new Error('useAgreements must be used inside AgreementsProvider');
  }
  return context;
};
