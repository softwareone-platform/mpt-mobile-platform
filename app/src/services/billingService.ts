import { useCallback, useMemo } from 'react';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useApi } from '@/hooks/useApi';
import type { PaginatedResponse, ListItemNoImageNoSubtitle } from '@/types/api';
import type { CreditMemoDetails } from '@/types/billing';

export function useBillingApi() {
  const api = useApi();

  const getCreditMemos = useCallback(
    async (
      offset: number = DEFAULT_OFFSET,
      limit: number = DEFAULT_PAGE_SIZE,
    ): Promise<PaginatedResponse<ListItemNoImageNoSubtitle>> => {
      const endpoint =
        `/v1/billing/credit-memos` +
        `?select=-*,id,status` +
        `&filter(group.buyers)` +
        `&order=-audit.created.at` +
        `&offset=${offset}` +
        `&limit=${limit}`;

      return api.get<PaginatedResponse<ListItemNoImageNoSubtitle>>(endpoint);
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

  const getInvoices = useCallback(
    async (
      offset: number = DEFAULT_OFFSET,
      limit: number = DEFAULT_PAGE_SIZE,
    ): Promise<PaginatedResponse<ListItemNoImageNoSubtitle>> => {
      const endpoint =
        `/v1/billing/invoices` +
        `?select=-*,id,status` +
        `&filter(group.buyers)` +
        `&order=-audit.created.at` +
        `&offset=${offset}` +
        `&limit=${limit}`;

      return api.get<PaginatedResponse<ListItemNoImageNoSubtitle>>(endpoint);
    },
    [api],
  );

  const getStatements = useCallback(
    async (
      offset: number = DEFAULT_OFFSET,
      limit: number = DEFAULT_PAGE_SIZE,
    ): Promise<PaginatedResponse<ListItemNoImageNoSubtitle>> => {
      const endpoint =
        `/v1/billing/statements` +
        `?select=-*,id,status` +
        `&filter(group.buyers)` +
        `&order=-audit.created.at` +
        `&offset=${offset}` +
        `&limit=${limit}`;

      return api.get<PaginatedResponse<ListItemNoImageNoSubtitle>>(endpoint);
    },
    [api],
  );

  return useMemo(
    () => ({
      getCreditMemos,
      getCreditMemoDetails,
      getInvoices,
      getStatements,
    }),
    [getCreditMemos, getCreditMemoDetails, getInvoices, getStatements],
  );
}
