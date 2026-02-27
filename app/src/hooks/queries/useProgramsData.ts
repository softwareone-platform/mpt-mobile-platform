import { usePaginatedQuery } from '@/hooks/queries/usePaginatedQuery';
import { useEnrollmentApi } from '@/services/enrollmentService';
import { useProgramApi } from '@/services/programService';
import type { ListItemFull, ListItemNoImageNoSubtitle } from '@/types/api';

export const useProgramsData = (
  userId: string | undefined,
  currentAccountId: string | undefined,
) => {
  const { getPrograms } = useProgramApi();

  return usePaginatedQuery<ListItemFull>({
    queryKey: ['programs', userId, currentAccountId],
    queryFn: getPrograms,
    enabled: !!userId && !!currentAccountId,
  });
};

export const useEnrollmentsData = (
  userId: string | undefined,
  currentAccountId: string | undefined,
  query?: string,
) => {
  const { getEnrollments } = useEnrollmentApi();

  return usePaginatedQuery<ListItemNoImageNoSubtitle>({
    queryKey: ['enrollments', userId, currentAccountId, query],
    queryFn: (offset, limit) => getEnrollments(offset, limit, query),
    enabled: !!userId && !!currentAccountId,
  });
};
