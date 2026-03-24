import { useCallback, useMemo } from 'react';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useApi } from '@/hooks/useApi';
import { logger } from '@/services/loggerService';
import type { PaginatedResponse } from '@/types/api';
import type { ChatItem } from '@/types/chat';

export function useChatApi() {
  const api = useApi();

  const getChats = useCallback(
    async (
      userId: string,
      offset: number = DEFAULT_OFFSET,
      limit: number = DEFAULT_PAGE_SIZE,
    ): Promise<PaginatedResponse<ChatItem>> => {
      const endpoint =
        `/v1/helpdesk/chats` +
        `?select=participants,lastMessage,lastMessage.audit,lastMessage.sender` +
        `&any(participants,eq(identity.id,"${userId}"))` +
        `&order=-lastMessage.audit.created.at` +
        `&offset=${offset}` +
        `&limit=${limit}`;

      const response = await api.get<PaginatedResponse<ChatItem>>(endpoint);

      logger.debug('[ChatService] Chats fetched', {
        count: response.data?.length ?? 0,
        total: response.$meta?.pagination?.total,
      });

      return response;
    },
    [api],
  );

  const getChat = useCallback(
    async (chatId: string): Promise<ChatItem> => {
      const endpoint = `/v1/helpdesk/chats/${chatId}?select=participants`;
      return await api.get<ChatItem>(endpoint);
    },
    [api],
  );

  return useMemo(
    () => ({
      getChats,
      getChat,
    }),
    [getChats, getChat],
  );
}
