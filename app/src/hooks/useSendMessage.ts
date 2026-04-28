import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';

import { AnalyticsEvents } from '@/constants/analytics';
import { useAccount } from '@/context/AccountContext';
import { useMessages } from '@/context/MessagesContext';
import { trackEvent } from '@/hooks/useTrackEvent';
import { logger } from '@/services/loggerService';
import { useMessageApi } from '@/services/messageService';
import type { Message, MessageVisibility } from '@/types/chat';

interface UseSendMessageParams {
  chatId: string | undefined;
  inputText: string;
  setInputText: (text: string) => void;
  onBeforeSend: () => void;
  visibility: MessageVisibility;
}

export function useSendMessage({
  chatId,
  inputText,
  setInputText,
  onBeforeSend,
  visibility,
}: UseSendMessageParams) {
  const { userData } = useAccount();
  const { addOptimisticMessage, replaceOptimisticMessage, markMessageFailed } = useMessages();
  const { saveMessage } = useMessageApi(chatId ?? '');
  const queryClient = useQueryClient();
  const isSendingRef = useRef(false);

  const currentUserId = userData?.id ?? '';
  const currentAccountId = userData?.currentAccount?.id;
  const userName = userData?.name ?? '';
  const userIcon = userData?.icon;

  const inputTextRef = useRef(inputText);
  inputTextRef.current = inputText;
  const setInputTextRef = useRef(setInputText);
  setInputTextRef.current = setInputText;
  const onBeforeSendRef = useRef(onBeforeSend);
  onBeforeSendRef.current = onBeforeSend;
  const visibilityRef = useRef(visibility);
  visibilityRef.current = visibility;

  return useCallback(async () => {
    const content = inputTextRef.current.trim().replace(/\n/g, '\n\n');
    if (!content || !chatId || isSendingRef.current) return;

    isSendingRef.current = true;
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticMessage: Message = {
      id: optimisticId,
      revision: 0,
      content,
      visibility: visibilityRef.current,
      isDeleted: false,
      links: [],
      identity: { id: currentUserId, name: userName, icon: userIcon, revision: 0 },
      audit: { created: { at: new Date().toISOString(), by: null } },
      _optimistic: true,
      _localKey: optimisticId,
    };

    onBeforeSendRef.current();
    addOptimisticMessage(optimisticMessage);
    setInputTextRef.current('');

    try {
      const response = await saveMessage({
        content,
        visibility: visibilityRef.current,
        isDeleted: false,
        links: [],
      });
      replaceOptimisticMessage(optimisticId, response);
      trackEvent(AnalyticsEvents.CHAT_MESSAGE_SENT, {
        chatId: chatId ?? '',
        messageLength: content.length,
      });
      if (currentUserId && currentAccountId) {
        void queryClient.invalidateQueries({
          queryKey: ['chats', currentUserId, currentAccountId],
        });
      }
    } catch (error) {
      logger.error('[useSendMessage] Failed to send message', error, {
        operation: 'sendMessage',
        chatId,
      });
      markMessageFailed(optimisticId);
      setInputTextRef.current(content);
    } finally {
      isSendingRef.current = false;
    }
  }, [
    chatId,
    currentUserId,
    userName,
    userIcon,
    currentAccountId,
    saveMessage,
    addOptimisticMessage,
    replaceOptimisticMessage,
    markMessageFailed,
    queryClient,
  ]);
}
