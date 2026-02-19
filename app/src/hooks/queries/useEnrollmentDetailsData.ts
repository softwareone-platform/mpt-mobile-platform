import { useQuery } from '@tanstack/react-query';

import { useEnrollmentApi } from '@/services/enrollmentService';
import type { EnrollmentDetails } from '@/types/program';
import { isUnauthorisedError } from '@/utils/apiError';

export const useEnrollmentDetailsData = (
  enrollmentId: string | undefined,
  userId: string | undefined,
  currentAccountId: string | undefined,
) => {
  const { getEnrollmentData } = useEnrollmentApi();

  const query = useQuery<EnrollmentDetails, Error>({
    queryKey: ['enrollmentDetails', enrollmentId, userId, currentAccountId],
    queryFn: () => {
      if (!enrollmentId) {
        throw new Error('Enrollment ID is required');
      }
      return getEnrollmentData(enrollmentId);
    },
    enabled: !!enrollmentId && !!userId && !!currentAccountId,
  });

  return {
    ...query,
    isUnauthorised: isUnauthorisedError(query.error),
  };
};
