import { useCallback, useMemo } from 'react';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useApi } from '@/hooks/useApi';
import type { PaginatedResponse } from '@/types/api';
import type { CreditMemo, CreditMemoDetails } from '@/types/billing';

export function useBillingApi() {
  const api = useApi();

  const getCreditMemos = useCallback(
    async (
      offset: number = DEFAULT_OFFSET,
      limit: number = DEFAULT_PAGE_SIZE,
    ): Promise<PaginatedResponse<CreditMemo>> => {
      const endpoint =
        `/v1/billing/credit-memos` +
        `?select=-*,id,documentNo,attributes.postingDate,attributes.documentDate,attributes.externalDocumentNo,status,price.totalSP` +
        `&filter(group.buyers)` +
        `&order=-audit.created.at` +
        `&offset=${offset}` +
        `&limit=${limit}`;

      return api.get<PaginatedResponse<CreditMemo>>(endpoint);
    },
    [api],
  );

  const getCreditMemoDetails = useCallback(
    async (creditMemoId: string): Promise<CreditMemoDetails> => {
      const endpoint =
        `/v1/billing/credit-memos/${creditMemoId}` +
        `?select=seller.address.country,audit,statement,statement.ledger.owner`;

      return api.get<CreditMemoDetails>(endpoint);
    },
    [api],
  );

  return useMemo(
    () => ({
      getCreditMemos,
      getCreditMemoDetails,
    }),
    [getCreditMemos, getCreditMemoDetails],
  );
}
