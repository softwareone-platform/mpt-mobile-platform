import { useCallback, useMemo } from 'react';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useApi } from '@/hooks/useApi';
import type { ChatsListResponse } from '@/types/chat';

export function useChatApi() {
  const api = useApi();

  const getChats = useCallback(
    async (
      offset: number = DEFAULT_OFFSET,
      limit: number = DEFAULT_PAGE_SIZE,
      query?: string,
    ): Promise<ChatsListResponse> => {
      const defaultQuery = '&order=-audit.updated.at';

      const endpoint =
        `/v1/helpdesk/chats` +
        `?${query || defaultQuery}` +
        `&offset=${offset}` +
        `&limit=${limit}`;

      return api.get<ChatsListResponse>(endpoint);
    },
    [api],
  );

  return useMemo(
    () => ({
      getChats,
    }),
    [getChats],
  );
}
