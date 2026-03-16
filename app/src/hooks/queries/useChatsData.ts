import { usePaginatedQuery } from '@/hooks/queries/usePaginatedQuery';
import { useChatApi } from '@/services/chatService';
import type { ChatItem } from '@/types/chat';

export const useChatsData = (userId: string | undefined, currentAccountId: string | undefined) => {
  const { getChats } = useChatApi();

  return usePaginatedQuery<ChatItem>({
    queryKey: ['chats', userId, currentAccountId],
    queryFn: (offset, limit) => getChats(userId!, offset, limit),
    enabled: !!userId && !!currentAccountId,
  });
};
