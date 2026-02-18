import { useQuery } from '@tanstack/react-query';

import { useProgramApi } from '@/services/programService';
import type { ProgramDetails } from '@/types/program';
import { isUnauthorisedError } from '@/utils/apiError';

export const useProgramDetailsData = (
  programId: string | undefined,
  userId: string | undefined,
  currentAccountId: string | undefined,
) => {
  const { getProgramData } = useProgramApi();

  const query = useQuery<ProgramDetails, Error>({
    queryKey: ['programDetails', programId, userId, currentAccountId],
    queryFn: () => {
      if (!programId) {
        throw new Error('Program ID is required');
      }
      return getProgramData(programId);
    },
    enabled: !!programId && !!userId && !!currentAccountId,
  });

  return {
    ...query,
    isUnauthorised: isUnauthorisedError(query.error),
  };
};
