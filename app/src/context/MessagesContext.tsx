import { useQueryClient } from '@tanstack/react-query';
import { createContext, ReactNode, useContext, useMemo, useEffect } from 'react';

import { useSignalR } from '@/context/SignalRContext';
import { useMessagesData } from '@/hooks/queries/useMessagesData';
import { logger } from '@/services/loggerService';
import type { Message } from '@/types/chat';
import type { EntitySubscription, ServerNotification } from '@/types/signalr';

interface MessagesContextValue {
  messages: Message[];
  messagesLoading: boolean;
  messagesFetchingNext: boolean;
  hasMoreMessages: boolean;
  messagesError: boolean;
  isUnauthorised: boolean;
  fetchMessages: () => void;
  chatId: string | undefined;
}

interface MessagesProviderProps {
  chatId: string | undefined;
  children: ReactNode;
}

const MessagesContext = createContext<MessagesContextValue | undefined>(undefined);

const MESSAGE_SUBSCRIPTIONS: EntitySubscription[] = [
  { moduleName: 'Helpdesk', entityName: 'ChatMessage' },
];

export const MessagesProvider = ({ chatId, children }: MessagesProviderProps) => {
  const queryClient = useQueryClient();
  const { subscribe, addMessageListener, addReconnectionListener } = useSignalR();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    isError,
    isUnauthorised,
    fetchNextPage,
  } = useMessagesData(chatId);

  const messages = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  useEffect(() => {
    if (chatId) {
      logger.debug('[MessagesContext] Entering chat dialogue, invalidating messages cache', {
        chatId,
      });
      void queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
    }
  }, [chatId, queryClient]);

  useEffect(() => {
    if (!chatId) return;

    void subscribe(MESSAGE_SUBSCRIPTIONS);

    const removeListener = addMessageListener((notification: ServerNotification) => {
      if (notification.entity !== 'ChatMessage') return;

      const message = notification.data as Message;

      if (!message?.id || !message?.identity || !message?.content) {
        logger.warn('[MessagesContext] Invalid message from SignalR, missing required fields', {
          hasId: !!message?.id,
          hasIdentity: !!message?.identity,
          hasContent: !!message?.content,
        });
        return;
      }

      if (message.chat?.id && message.chat.id !== chatId) {
        return;
      }

      logger.debug('[MessagesContext] New message received via SignalR, invalidating cache', {
        messageId: message.id,
        event: notification.event,
        chatId,
      });

      void queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
    });

    const removeReconnectionListener = addReconnectionListener(() => {
      logger.debug('[MessagesContext] SignalR reconnected, invalidating messages', { chatId });
      void queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
    });

    return () => {
      removeListener();
      removeReconnectionListener();
    };
  }, [chatId, subscribe, addMessageListener, addReconnectionListener, queryClient]);

  return (
    <MessagesContext.Provider
      value={{
        messages,
        messagesLoading: isLoading,
        messagesFetchingNext: isFetchingNextPage,
        hasMoreMessages: !!hasNextPage,
        messagesError: isError,
        isUnauthorised,
        fetchMessages: fetchNextPage,
        chatId,
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error('useMessages must be used inside MessagesProvider');
  }
  return context;
};
