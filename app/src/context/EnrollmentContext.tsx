import { createContext, ReactNode, useContext, useMemo } from 'react';

import { useAccount } from '@/context/AccountContext';
import { useEnrollmentsData } from '@/hooks/queries/useProgramsData';
import type { ListItemNoImageNoSubtitle } from '@/types/api';

interface EnrollmentContextValue {
  enrollments: ListItemNoImageNoSubtitle[];
  isEnrollmentsLoading: boolean;
  isEnrollmentsFetchingNext: boolean;
  hasMoreEnrollments: boolean;
  isEnrollmentsError: boolean;
  isUnauthorised: boolean;
  fetchEnrollmentsNextPage: () => void;
}

interface EnrollmentProviderProps {
  children: ReactNode;
  query?: string;
}

const EnrollmentContext = createContext<EnrollmentContextValue | undefined>(undefined);

export const EnrollmentProvider = ({ children, query }: EnrollmentProviderProps) => {
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
  } = useEnrollmentsData(userId, currentAccountId, query);

  const enrollments = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  return (
    <EnrollmentContext.Provider
      value={{
        enrollments,
        isEnrollmentsLoading: isLoading,
        isEnrollmentsFetchingNext: isFetchingNextPage,
        hasMoreEnrollments: !!hasNextPage,
        isEnrollmentsError: isError,
        isUnauthorised,
        fetchEnrollmentsNextPage: fetchNextPage,
      }}
    >
      {children}
    </EnrollmentContext.Provider>
  );
};

export const useEnrollments = () => {
  const context = useContext(EnrollmentContext);
  if (!context) {
    throw new Error('useEnrollments must be used inside EnrollmentProvider');
  }
  return context;
};
