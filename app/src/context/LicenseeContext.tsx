import { createContext, ReactNode, useContext, useMemo } from 'react';

import { useAccount } from '@/context/AccountContext';
import { useLicenseesData } from '@/hooks/queries/useLicenseesData';
import type { Licensee } from '@/types/api';

interface LicenseeContextValue {
  licensees: Licensee[];
  isLicenseesLoading: boolean;
  isLicenseesFetchingNext: boolean;
  hasMoreLicensees: boolean;
  isLicenseesError: boolean;
  isUnauthorised: boolean;
  fetchLicensees: () => void;
}

const LicenseeContext = createContext<LicenseeContextValue | undefined>(undefined);

export const LicenseeProvider = ({ children }: { children: ReactNode }) => {
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
  } = useLicenseesData(userId, currentAccountId);

  const licensees = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  return (
    <LicenseeContext.Provider
      value={{
        licensees,
        isLicenseesLoading: isLoading,
        isLicenseesFetchingNext: isFetchingNextPage,
        hasMoreLicensees: !!hasNextPage,
        isLicenseesError: isError,
        isUnauthorised,
        fetchLicensees: fetchNextPage,
      }}
    >
      {children}
    </LicenseeContext.Provider>
  );
};

export const useLicensees = () => {
  const context = useContext(LicenseeContext);
  if (!context) {
    throw new Error('useLicensees must be used inside LicenseeProvider');
  }
  return context;
};
