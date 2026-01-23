import { useCallback, useMemo } from 'react';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useApi } from '@/hooks/useApi';
import type { PaginatedResponse } from '@/types/api';
import type { Program, Enrollment } from '@/types/program';

export function useProgramApi() {
  const api = useApi();

  const getPrograms = useCallback(
    async (
      offset: number = DEFAULT_OFFSET,
      limit: number = DEFAULT_PAGE_SIZE,
    ): Promise<PaginatedResponse<Program>> => {
      const endpoint =
        `/v1/program/programs` +
        `?select=audit&ne(status,%22Deleted%22)` +
        `&order=name` +
        `&offset=${offset}` +
        `&limit=${limit}`;

      return api.get<PaginatedResponse<Program>>(endpoint);
    },
    [api],
  );

  const getEnrollments = useCallback(
    async (
      offset: number = DEFAULT_OFFSET,
      limit: number = DEFAULT_PAGE_SIZE,
    ): Promise<PaginatedResponse<Enrollment>> => {
      const endpoint =
        `/v1/program/enrollments` +
        `?select=audit,certificate.client,program.vendor,licensee.account.id,assignee.currentAccount.id` +
        `&ne(status,%22Deleted%22)` +
        `&order=-id` +
        `&offset=${offset}` +
        `&limit=${limit}`;

      return api.get<PaginatedResponse<Enrollment>>(endpoint);
    },
    [api],
  );

  return useMemo(
    () => ({
      getPrograms,
      getEnrollments,
    }),
    [getPrograms, getEnrollments],
  );
}
