import { usePaginatedQuery } from '@/hooks/queries/usePaginatedQuery';
import { useChatApi } from '@/services/chatService';
import type { ChatItem } from '@/types/chat';

export const useChatsData = (
  userId: string | undefined,
  currentAccountId: string | undefined,
  query?: string,
) => {
  const { getChats } = useChatApi();

  return usePaginatedQuery<ChatItem>({
    queryKey: ['chats', userId, currentAccountId, query],
    queryFn: (offset, limit) => getChats(offset, limit, query),
    enabled: !!userId && !!currentAccountId,
  });
};
