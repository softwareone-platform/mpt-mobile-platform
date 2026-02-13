import { useQuery } from '@tanstack/react-query';

import { useLicenseeApi } from '@/services/licenseeService';
import { LicenseeData } from '@/types/admin';
import { isUnauthorisedError } from '@/utils/apiError';

export const useLicenseeDetailsData = (
  licenseeId: string | undefined,
  currentUserId: string | undefined,
  currentAccountId: string | undefined,
) => {
  const { getLicenseeData } = useLicenseeApi();

  const query = useQuery<LicenseeData, Error>({
    queryKey: ['licenseeDetails', licenseeId, currentUserId, currentAccountId],
    queryFn: () => {
      if (!licenseeId) {
        throw new Error('Licensee ID is required');
      }
      return getLicenseeData(licenseeId);
    },
    enabled: !!licenseeId && !!currentUserId && !!currentAccountId,
  });

  return {
    ...query,
    isUnauthorised: isUnauthorisedError(query.error),
  };
};
