import { useCallback, useMemo } from 'react';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useApi } from '@/hooks/useApi';
import type { Agreement, AgreementData } from '@/types/agreement';
import type { PaginatedResponse } from '@/types/api';

export function useAgreementApi() {
  const api = useApi();

  const getAgreements = useCallback(
    async (
      offset: number = DEFAULT_OFFSET,
      limit: number = DEFAULT_PAGE_SIZE,
    ): Promise<PaginatedResponse<Agreement>> => {
      const endpoint =
        `/v1/commerce/agreements` +
        `?select=audit` +
        `&filter(group.buyers)` +
        `&and(ne(status,"Draft"),ne(status,"Failed"))` +
        `&order=externalIds.client` +
        `&offset=${offset}` +
        `&limit=${limit}`;

      return api.get<PaginatedResponse<Agreement>>(endpoint);
    },
    [api],
  );

  const getAgreementData = useCallback(
    async (agreementId: string): Promise<AgreementData> => {
      const endpoint =
        `/v1/commerce/agreements/${agreementId}` +
        `?select=+listing,product,audit,licensee,buyer,seller,certificates,-subscriptions,-lines,termsAndConditions,termsAndConditions.acceptedBy`;
      return api.get<AgreementData>(endpoint);
    },
    [api],
  );

  return useMemo(
    () => ({
      getAgreements,
      getAgreementData,
    }),
    [getAgreements, getAgreementData],
  );
}
