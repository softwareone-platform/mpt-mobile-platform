import { useCallback, useMemo } from 'react';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useApi } from '@/hooks/useApi';
import type { ChatsListResponse } from '@/types/chat';

export function useChatApi() {
  const api = useApi();

  const getChats = useCallback(
    async (
      userId: string,
      offset: number = DEFAULT_OFFSET,
      limit: number = DEFAULT_PAGE_SIZE,
      query?: string,
    ): Promise<ChatsListResponse> => {
      const selectParams = 'select=participants,lastMessage,lastMessage.audit,lastMessage.sender';
      const filterParams = `any(participants,eq(identity.id,"${userId}"))`;
      const orderParams = 'order=-lastMessage.audit.created.at';

      const endpoint =
        `/v1/helpdesk/chats` +
        `?${selectParams}` +
        `&${filterParams}` +
        `&${orderParams}` +
        `&offset=${offset}` +
        `&limit=${limit}`;

      console.info('[ChatService] Fetching chats', { endpoint, offset, limit, userId });

      const response = await api.get<ChatsListResponse>(endpoint);

      console.info('[ChatService] Chats response', {
        dataCount: response.data?.length ?? 0,
        pagination: response.$meta?.pagination,
        firstChat: response.data?.[0],
      });

      return response;
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
