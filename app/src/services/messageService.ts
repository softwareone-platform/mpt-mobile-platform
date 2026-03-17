import { useCallback, useMemo } from 'react';

import { DEFAULT_OFFSET, MESSAGE_PAGE_SIZE } from '@/constants/api';
import { useApi } from '@/hooks/useApi';
import type { PaginatedResponse } from '@/types/api';
import type { Message } from '@/types/chat';

export function useMessageApi(chatId: string) {
  const api = useApi();

  const getMessages = useCallback(
    async (
      offset: number = DEFAULT_OFFSET,
      limit: number = MESSAGE_PAGE_SIZE,
    ): Promise<PaginatedResponse<Message>> => {
      const endpoint =
        `/v1/helpdesk/chats/${chatId}/messages` +
        `?select=audit,audit.created,links,sender,sender.identity,identity,content,visibility,isDeleted` +
        `&order=-audit.created.at` +
        `&offset=${offset}` +
        `&limit=${limit}`;

      const response = await api.get<PaginatedResponse<Message>>(endpoint);

      return response;
    },
    [api, chatId],
  );

  return useMemo(
    () => ({
      getMessages,
    }),
    [getMessages],
  );
}
