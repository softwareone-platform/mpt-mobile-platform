import { useCallback, useMemo } from 'react';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useApi } from '@/hooks/useApi';
import type { PaginatedResponse, ListItemNoImageNoSubtitle } from '@/types/api';
import type { CreditMemoDetails, InvoiceDetails, StatementDetails } from '@/types/billing';

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
      query?: string,
    ): Promise<PaginatedResponse<ListItemNoImageNoSubtitle>> => {
      const defaultQuery = '&filter(group.buyers)&order=-audit.created.at';

      const endpoint =
        `/v1/billing/invoices` +
        `?select=-*,id,status` +
        `${query || defaultQuery}` +
        `&offset=${offset}` +
        `&limit=${limit}`;

      return api.get<PaginatedResponse<ListItemNoImageNoSubtitle>>(endpoint);
    },
    [api],
  );

  const getInvoiceData = useCallback(
    async (invoiceId: string): Promise<InvoiceDetails> => {
      const endpoint =
        `/v1/billing/invoices/${invoiceId}` +
        `?select=seller.address.country,statement,statement.ledger.owner,audit`;

      return api.get<InvoiceDetails>(endpoint);
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

  const getStatementData = useCallback(
    async (statementId: string): Promise<StatementDetails> => {
      const endpoint = `/v1/billing/statements/${statementId}?select=seller.address.country,audit,ledger.owner`;

      return api.get<StatementDetails>(endpoint);
    },
    [api],
  );

  return useMemo(
    () => ({
      getCreditMemos,
      getCreditMemoDetails,
      getInvoices,
      getInvoiceData,
      getStatements,
      getStatementData,
    }),
    [
      getCreditMemos,
      getCreditMemoDetails,
      getInvoices,
      getInvoiceData,
      getStatements,
      getStatementData,
    ],
  );
}
