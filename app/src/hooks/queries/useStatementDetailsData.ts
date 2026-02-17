import { useQuery } from '@tanstack/react-query';

import { useBillingApi } from '@/services/billingService';
import type { StatementDetails } from '@/types/billing';
import { isUnauthorisedError } from '@/utils/apiError';

export const useStatementDetailsData = (
  statementId: string | undefined,
  userId: string | undefined,
  currentAccountId: string | undefined,
) => {
  const { getStatementData } = useBillingApi();

  const query = useQuery<StatementDetails, Error>({
    queryKey: ['statementDetails', statementId, userId, currentAccountId],
    queryFn: () => {
      if (!statementId) {
        throw new Error('Statement ID is required');
      }
      return getStatementData(statementId);
    },
    enabled: !!statementId && !!userId && !!currentAccountId,
  });

  return {
    ...query,
    isUnauthorised: isUnauthorisedError(query.error),
  };
};
