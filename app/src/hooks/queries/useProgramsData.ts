import { usePaginatedQuery } from '@/hooks/queries/usePaginatedQuery';
import { useEnrollmentApi } from '@/services/enrollmentService';
import { useProgramApi } from '@/services/programService';
import type { Program, Enrollment } from '@/types/program';

export const useProgramsData = (
  userId: string | undefined,
  currentAccountId: string | undefined,
) => {
  const { getPrograms } = useProgramApi();

  return usePaginatedQuery<Program>({
    queryKey: ['programs', userId, currentAccountId],
    queryFn: getPrograms,
    enabled: !!userId && !!currentAccountId,
  });
};

export const useEnrollmentsData = (
  userId: string | undefined,
  currentAccountId: string | undefined,
) => {
  const { getEnrollments } = useEnrollmentApi();

  return usePaginatedQuery<Enrollment>({
    queryKey: ['enrollments', userId, currentAccountId],
    queryFn: getEnrollments,
    enabled: !!userId && !!currentAccountId,
  });
};
