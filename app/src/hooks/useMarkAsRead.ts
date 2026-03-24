import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { ViewToken } from 'react-native';

import { logger } from '@/services/loggerService';
import type { ChatParticipant, Message } from '@/types/chat';

const VIEWABILITY_ITEM_PERCENT_THRESHOLD = 50;
const VIEWABILITY_MIN_VIEW_TIME_MS = 500;
const MARK_AS_READ_DEBOUNCE_MS = 200;

interface UseMarkAsReadParams {
  chatId: string | undefined;
  myParticipant: ChatParticipant | undefined;
  messages: Message[];
  contentFillsScreen: boolean;
  saveParticipant: (participant: Partial<ChatParticipant>) => Promise<ChatParticipant>;
}

export function useMarkAsRead({
  chatId,
  myParticipant,
  messages,
  contentFillsScreen,
  saveParticipant,
}: UseMarkAsReadParams) {
  const queryClient = useQueryClient();
  const lastReadMessageIdRef = useRef<string | null>(null);
  const markAsReadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingMessageIdRef = useRef<string | null>(null);
  const pendingMessageCreatedAtRef = useRef<string | null>(null);
  const contentFillsScreenRef = useRef(contentFillsScreen);

  useEffect(() => {
    contentFillsScreenRef.current = contentFillsScreen;
  }, [contentFillsScreen]);

  const markAsRead = useCallback(
    async (messageId: string, messageCreatedAt: string) => {
      const currentParticipant = myParticipant;

      if (!currentParticipant?.id || !chatId) {
        return;
      }

      if (messageId === lastReadMessageIdRef.current) {
        return;
      }

      const currentLastReadMessage = currentParticipant.lastReadMessage;
      if (currentLastReadMessage?.id) {
        const currentLastReadTimestamp = messages.find((m) => m.id === currentLastReadMessage.id)
          ?.audit.created?.at;

        if (currentLastReadTimestamp) {
          const currentDate = new Date(currentLastReadTimestamp);
          const messageDate = new Date(messageCreatedAt);
          if (messageDate <= currentDate) {
            return;
          }
        }
      }

      lastReadMessageIdRef.current = messageId;

      try {
        await saveParticipant({
          id: currentParticipant.id,
          lastReadMessage: { id: messageId },
        });
      } catch (error) {
        lastReadMessageIdRef.current = null;

        void queryClient.invalidateQueries({ queryKey: ['chats'] });

        const errorMessage =
          error instanceof Error
            ? error.message
            : typeof error === 'object' && error !== null
              ? JSON.stringify(error)
              : 'Unknown error';
        logger.warn('[useMarkAsRead] Failed to mark message as read (non-critical)', {
          operation: 'markAsRead',
          messageId,
          error: errorMessage,
        });
      }
    },
    [myParticipant, chatId, saveParticipant, messages, queryClient],
  );

  useEffect(() => {
    return () => {
      if (markAsReadTimeoutRef.current) {
        clearTimeout(markAsReadTimeoutRef.current);
        const pendingId = pendingMessageIdRef.current;
        const pendingCreatedAt = pendingMessageCreatedAtRef.current;
        if (pendingId && pendingCreatedAt) {
          void markAsRead(pendingId, pendingCreatedAt);
        }
      }
    };
  }, [markAsRead]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length === 0) {
        return;
      }

      const newestVisibleMessage = contentFillsScreenRef.current
        ? viewableItems[0]
        : viewableItems[viewableItems.length - 1];
      const messageItem = newestVisibleMessage?.item as Message | undefined;
      const messageId = messageItem?.id;
      const messageCreatedAt = messageItem?.audit?.created?.at;

      if (!messageId || !messageCreatedAt || messageId === lastReadMessageIdRef.current) {
        return;
      }

      pendingMessageIdRef.current = messageId;
      pendingMessageCreatedAtRef.current = messageCreatedAt;

      if (markAsReadTimeoutRef.current) {
        clearTimeout(markAsReadTimeoutRef.current);
      }

      markAsReadTimeoutRef.current = setTimeout(() => {
        const pendingId = pendingMessageIdRef.current;
        const pendingCreatedAt = pendingMessageCreatedAtRef.current;
        if (pendingId && pendingCreatedAt && pendingId !== lastReadMessageIdRef.current) {
          void markAsRead(pendingId, pendingCreatedAt);
        }
        markAsReadTimeoutRef.current = null;
      }, MARK_AS_READ_DEBOUNCE_MS);
    },
    [markAsRead],
  );

  const viewabilityConfig = useMemo(
    () => ({
      itemVisiblePercentThreshold: VIEWABILITY_ITEM_PERCENT_THRESHOLD,
      minimumViewTime: VIEWABILITY_MIN_VIEW_TIME_MS,
    }),
    [],
  );

  return {
    onViewableItemsChanged,
    viewabilityConfig,
  };
}
