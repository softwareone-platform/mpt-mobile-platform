import { useMutation } from '@tanstack/react-query';

import { useChatApi } from '@/services/chatService';
import type { CreateChatPayload } from '@/types/chat';

export const useCreateChatMutation = () => {
  const { createChat } = useChatApi();

  return useMutation({
    mutationFn: (payload: CreateChatPayload) => createChat(payload),
  });
};
