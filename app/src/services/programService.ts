import { useCallback, useMemo } from 'react';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useApi } from '@/hooks/useApi';
import type { PaginatedResponse } from '@/types/api';
import type { Program } from '@/types/program';

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

  return useMemo(
    () => ({
      getPrograms,
    }),
    [getPrograms],
  );
}
