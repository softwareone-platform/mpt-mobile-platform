import { useCallback, useMemo } from 'react';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useApi } from '@/hooks/useApi';
import { logger } from '@/services/loggerService';
import type { PaginatedResponse } from '@/types/api';
import type { Contact } from '@/types/chat';
import type { ApiError } from '@/utils/apiError';

export function useContactsApi() {
  const api = useApi();

  const getContacts = useCallback(
    async (
      userId: string,
      offset: number = DEFAULT_OFFSET,
      limit: number = DEFAULT_PAGE_SIZE,
      search?: string,
    ): Promise<PaginatedResponse<Contact>> => {
      const baseFilters = `and(and(and(eq(chat,true),ne(status,"deleted")),ne(identity.id,"${userId}")),any(directories))`;
      const filters = search
        ? `and(${baseFilters},ilike(identity.name,"*${search}*"))`
        : baseFilters;

      const endpoint =
        `/v1/notifications/contacts` +
        `?select=identity` +
        `&${filters}` +
        `&order=identity.name` +
        `&offset=${offset}` +
        `&limit=${limit}`;

      logger.debug('[ContactsService] Fetching contacts', {
        userId,
        search,
        offset,
        limit,
        endpoint,
      });

      try {
        const response = await api.get<PaginatedResponse<Contact>>(endpoint);

        logger.debug('[ContactsService] Contacts fetched', {
          count: response.data?.length ?? 0,
          total: response.$meta?.pagination?.total,
        });

        return response;
      } catch (error) {
        const apiError = error as ApiError;
        logger.error('[ContactsService] Failed to fetch contacts', error, {
          userId,
          search,
          offset,
          limit,
          endpoint,
          httpStatus: apiError?.status ?? undefined,
          errorMessage: apiError?.message,
          errorDetails: JSON.stringify(apiError?.details),
        });
        throw error;
      }
    },
    [api],
  );

  return useMemo(() => ({ getContacts }), [getContacts]);
}
