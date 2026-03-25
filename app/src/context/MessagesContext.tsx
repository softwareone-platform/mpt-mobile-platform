import { useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useEffect,
  useState,
} from 'react';

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
  addOptimisticMessage: (message: Message) => void;
  replaceOptimisticMessage: (optimisticId: string, realMessage: Message) => void;
  markMessageFailed: (optimisticId: string) => void;
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

  const [localMessages, setLocalMessages] = useState<Message[]>([]);

  const addOptimisticMessage = useCallback((message: Message) => {
    setLocalMessages((prev) => [message, ...prev]);
  }, []);

  const replaceOptimisticMessage = useCallback((optimisticId: string, realMessage: Message) => {
    setLocalMessages((prev) =>
      prev.map((m) => (m.id === optimisticId ? { ...realMessage, _localKey: m._localKey } : m)),
    );
  }, []);

  const markMessageFailed = useCallback((optimisticId: string) => {
    setLocalMessages((prev) =>
      prev.map((m) =>
        m.id === optimisticId ? { ...m, _optimistic: undefined, _failed: true as const } : m,
      ),
    );
  }, []);

  const messages = useMemo(() => {
    const serverMessages = data?.pages.flatMap((page) => page.data) ?? [];
    const serverIds = new Set(serverMessages.map((m) => m.id));
    const localOnlyMessages = localMessages.filter((m) => !serverIds.has(m.id));

    // Transfer _localKey from local messages to their server counterparts so the
    // FlatList keyExtractor returns the same key through the local→server transition,
    // preventing item remount and the scroll jump it causes via maintainVisibleContentPosition.
    const localKeyById = new Map(
      localMessages
        .filter((m) => serverIds.has(m.id) && m._localKey)
        .map((m) => [m.id, m._localKey!]),
    );
    const mergedServerMessages =
      localKeyById.size > 0
        ? serverMessages.map((m) =>
            localKeyById.has(m.id) ? { ...m, _localKey: localKeyById.get(m.id) } : m,
          )
        : serverMessages;

    return [...localOnlyMessages, ...mergedServerMessages];
  }, [data, localMessages]);

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

      logger.debug('[MessagesContext] New message received via SignalR, adding to local messages', {
        messageId: message.id,
        event: notification.event,
        chatId,
      });

      setLocalMessages((prev) => {
        const exists = prev.some((m) => m.id === message.id);
        return exists ? prev : [message, ...prev];
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
        addOptimisticMessage,
        replaceOptimisticMessage,
        markMessageFailed,
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
