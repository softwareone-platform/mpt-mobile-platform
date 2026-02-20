import { useQuery } from '@tanstack/react-query';

import { useCertificateApi } from '@/services/certificateService';
import type { CertificateDetails } from '@/types/program';
import { isUnauthorisedError } from '@/utils/apiError';

export const useCertificateDetailsData = (
  certificateId: string | undefined,
  userId: string | undefined,
  currentAccountId: string | undefined,
) => {
  const { getCertificateData } = useCertificateApi();

  const query = useQuery<CertificateDetails, Error>({
    queryKey: ['certificateDetails', certificateId, userId, currentAccountId],
    queryFn: () => {
      if (!certificateId) {
        throw new Error('Certificate ID is required');
      }
      return getCertificateData(certificateId);
    },
    enabled: !!certificateId && !!userId && !!currentAccountId,
  });

  return {
    ...query,
    isUnauthorised: isUnauthorisedError(query.error),
  };
};
