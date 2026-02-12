import { useQuery } from '@tanstack/react-query';

import { useAgreementApi } from '@/services/agreementService';
import { AgreementData } from '@/types/agreement';
import { isUnauthorisedError } from '@/utils/apiError';

export const useAgreementDetailsData = (
  agreementId: string | undefined,
  currentUserId: string | undefined,
  currentAccountId: string | undefined,
) => {
  const { getAgreementData } = useAgreementApi();

  const query = useQuery<AgreementData, Error>({
    queryKey: ['agreementDetails', agreementId, currentUserId, currentAccountId],
    queryFn: () => {
      if (!agreementId) {
        throw new Error('Agreement ID is required');
      }
      return getAgreementData(agreementId);
    },
    enabled: !!agreementId && !!currentUserId && !!currentAccountId,
  });

  return {
    ...query,
    isUnauthorised: isUnauthorisedError(query.error),
  };
};
