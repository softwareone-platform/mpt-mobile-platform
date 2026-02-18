import { useCallback, useMemo } from 'react';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useApi } from '@/hooks/useApi';
import type { PaginatedResponse, ListItemFull } from '@/types/api';
import type { ProgramDetails } from '@/types/program';

export function useProgramApi() {
  const api = useApi();

  const getPrograms = useCallback(
    async (
      offset: number = DEFAULT_OFFSET,
      limit: number = DEFAULT_PAGE_SIZE,
    ): Promise<PaginatedResponse<ListItemFull>> => {
      const endpoint =
        `/v1/program/programs` +
        `?select=audit&ne(status,%22Deleted%22)` +
        `&order=name` +
        `&offset=${offset}` +
        `&limit=${limit}`;

      return api.get<PaginatedResponse<ListItemFull>>(endpoint);
    },
    [api],
  );

  const getProgramData = useCallback(
    async (programId: string): Promise<ProgramDetails> => {
      const endpoint = `/v1/program/programs/${programId}`;

      return api.get<ProgramDetails>(endpoint);
    },
    [api],
  );

  return useMemo(
    () => ({
      getPrograms,
      getProgramData,
    }),
    [getPrograms, getProgramData],
  );
}
