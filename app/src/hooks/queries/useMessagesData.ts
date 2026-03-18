import { MESSAGE_PAGE_SIZE } from '@/constants/api';
import { usePaginatedQuery } from '@/hooks/queries/usePaginatedQuery';
import { useMessageApi } from '@/services/messageService';
import type { Message } from '@/types/chat';

export const useMessagesData = (chatId: string | undefined) => {
  const messageApi = useMessageApi(chatId ?? '');

  return usePaginatedQuery<Message>({
    queryKey: ['messages', chatId],
    queryFn: (offset, limit) => {
      if (!chatId) {
        throw new Error('chatId is required for fetching messages');
      }
      return messageApi.getMessages(offset, limit);
    },
    enabled: !!chatId,
    pageSize: MESSAGE_PAGE_SIZE,
  });
};
