import { useMemo } from 'react';

import type { ChatItem, ChatParticipant } from '@/types/chat';

export const useMyParticipant = (
  chat: ChatItem | undefined,
  currentUserId: string,
): ChatParticipant | undefined => {
  return useMemo(() => {
    if (!chat?.participants || !currentUserId) {
      return undefined;
    }

    return chat.participants.find((p) => p.identity?.id === currentUserId && p.status !== 'Exited');
  }, [chat, currentUserId]);
};
