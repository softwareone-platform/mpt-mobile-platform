import { createContext, ReactNode, useContext, useMemo } from 'react';

import { useAccount } from '@/context/AccountContext';
import { useCertificatesData } from '@/hooks/queries/useProgramsData';
import type { ListItemNoImage } from '@/types/api';

interface CertificateContextValue {
  certificates: ListItemNoImage[];
  isCertificatesLoading: boolean;
  isCertificatesFetchingNext: boolean;
  hasMoreCertificates: boolean;
  isCertificatesError: boolean;
  isUnauthorised: boolean;
  fetchCertificatesNextPage: () => void;
}

interface CertificateProviderProps {
  children: ReactNode;
}

const CertificateContext = createContext<CertificateContextValue | undefined>(undefined);

export const CertificateProvider = ({ children }: CertificateProviderProps) => {
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
  } = useCertificatesData(userId, currentAccountId);

  const certificates = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  return (
    <CertificateContext.Provider
      value={{
        certificates,
        isCertificatesLoading: isLoading,
        isCertificatesFetchingNext: isFetchingNextPage,
        hasMoreCertificates: !!hasNextPage,
        isCertificatesError: isError,
        isUnauthorised,
        fetchCertificatesNextPage: fetchNextPage,
      }}
    >
      {children}
    </CertificateContext.Provider>
  );
};

export const useCertificates = () => {
  const context = useContext(CertificateContext);
  if (!context) {
    throw new Error('useCertificates must be used inside CertificateProvider');
  }
  return context;
};
