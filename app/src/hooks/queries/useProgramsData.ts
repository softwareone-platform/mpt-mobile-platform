import { usePaginatedQuery } from '@/hooks/queries/usePaginatedQuery';
import { useProgramApi } from '@/services/programService';
import type { Program } from '@/types/program';

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
