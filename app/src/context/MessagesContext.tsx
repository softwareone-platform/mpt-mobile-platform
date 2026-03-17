import { createContext, ReactNode, useContext, useMemo } from 'react';

import { useMessagesData } from '@/hooks/queries/useMessagesData';
import type { Message } from '@/types/chat';

interface MessagesContextValue {
  messages: Message[];
  messagesLoading: boolean;
  messagesFetchingNext: boolean;
  hasMoreMessages: boolean;
  messagesError: boolean;
  isUnauthorised: boolean;
  fetchMessages: () => void;
}

interface MessagesProviderProps {
  chatId: string | undefined;
  children: ReactNode;
}

const MessagesContext = createContext<MessagesContextValue | undefined>(undefined);

export const MessagesProvider = ({ chatId, children }: MessagesProviderProps) => {
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
