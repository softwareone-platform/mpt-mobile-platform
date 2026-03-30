import { useCallback, useMemo } from 'react';

import { DEFAULT_OFFSET, MESSAGE_PAGE_SIZE } from '@/constants/api';
import { useApi } from '@/hooks/useApi';
import { logger } from '@/services/loggerService';
import type { PaginatedResponse } from '@/types/api';
import type { Message } from '@/types/chat';

export type MessageInput = {
  content: string;
  visibility: 'Public' | 'Private';
  isDeleted: boolean;
  links?: unknown[];
};

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

  const saveMessage = useCallback(
    async (message: MessageInput): Promise<Message> => {
      const endpoint = `/v1/helpdesk/chats/${chatId}/messages`;

      logger.debug('[MessageService] Sending message', {
        operation: 'saveMessage',
        chatId,
        visibility: message.visibility,
      });

      try {
        return await api.post<Message, MessageInput>(endpoint, message);
      } catch (error) {
        logger.error('[MessageService] Failed to send message', error, {
          operation: 'saveMessage',
          chatId,
          endpoint,
        });
        throw error;
      }
    },
    [api, chatId],
  );

  return useMemo(
    () => ({
      getMessages,
      saveMessage,
    }),
    [getMessages, saveMessage],
  );
}
