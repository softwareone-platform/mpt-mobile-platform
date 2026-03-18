import { useQueryClient } from '@tanstack/react-query';
import { createContext, ReactNode, useContext, useMemo, useEffect } from 'react';

import { useAccount } from '@/context/AccountContext';
import { useChatsData } from '@/hooks/queries/useChatsData';
import { logger } from '@/services/loggerService';
import type { ChatItem } from '@/types/chat';

interface ChatsContextValue {
  chats: ChatItem[];
  chatsLoading: boolean;
  chatsFetchingNext: boolean;
  hasMoreChats: boolean;
  chatsError: boolean;
  isUnauthorised: boolean;
  fetchChats: () => void;
}

interface ChatsProviderProps {
  children: ReactNode;
}

const ChatsContext = createContext<ChatsContextValue | undefined>(undefined);

export const ChatsProvider = ({ children }: ChatsProviderProps) => {
  const queryClient = useQueryClient();
  const { userData } = useAccount();

  const userId = userData?.id;
  const currentAccountId = userData?.currentAccount?.id;

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    isError,
    isUnauthorised,
    fetchNextPage,
  } = useChatsData(userId, currentAccountId);

  const chats = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  useEffect(() => {
    if (userId && currentAccountId) {
      logger.debug('[ChatsContext] Entering chat list, invalidating chats cache', {
        userId,
        currentAccountId,
      });
      void queryClient.invalidateQueries({ queryKey: ['chats', userId, currentAccountId] });
    }
  }, [userId, currentAccountId, queryClient]);

  useEffect(() => {
    if (data) {
      logger.debug('[ChatsContext] Chats data fetched:', {
        pageCount: data.pages.length,
        totalChats: chats.length,
      });
      if (!chats.length) {
        logger.debug('[ChatsContext] No chats in response');
      }
    }
  }, [data, chats]);

  return (
    <ChatsContext.Provider
      value={{
        chats,
        chatsLoading: isLoading,
        chatsFetchingNext: isFetchingNextPage,
        hasMoreChats: !!hasNextPage,
        chatsError: isError,
        isUnauthorised,
        fetchChats: fetchNextPage,
      }}
    >
      {children}
    </ChatsContext.Provider>
  );
};

export const useChats = () => {
  const context = useContext(ChatsContext);
  if (!context) {
    throw new Error('useChats must be used inside ChatsProvider');
  }
  return context;
};
