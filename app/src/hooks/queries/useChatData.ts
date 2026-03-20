import { useQuery } from '@tanstack/react-query';

import { useChatApi } from '@/services/chatService';

export const useChatData = (chatId: string | undefined) => {
  const { getChat } = useChatApi();

  return useQuery({
    queryKey: ['chat', chatId],
    queryFn: () => {
      if (!chatId) {
        throw new Error('chatId is required for fetching chat');
      }
      return getChat(chatId);
    },
    enabled: !!chatId,
  });
};
