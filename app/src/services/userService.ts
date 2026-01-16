import { useCallback, useMemo } from 'react';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useApi } from '@/hooks/useApi';
import type { PaginatedResponse, User } from '@/types/api';

export function useUserApi() {
  const api = useApi();

  const getUsers = useCallback(
    async (
      offset: number = DEFAULT_OFFSET,
      limit: number = DEFAULT_PAGE_SIZE,
    ): Promise<PaginatedResponse<User>> => {
      const endpoint =
        `/v1/accounts/users` +
        `?select=audit,accounts` +
        `&order=name` +
        `&offset=${offset}` +
        `&limit=${limit}`;

      return api.get<PaginatedResponse<User>>(endpoint);
    },
    [api],
  );

  return useMemo(
    () => ({
      getUsers,
    }),
    [getUsers],
  );
}
