import { createContext, ReactNode, useContext, useEffect, useMemo } from 'react';

import { useAccount } from '@/context/AccountContext';
import { useChatsData } from '@/hooks/queries/useChatsData';
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
  query?: string;
}

const ChatsContext = createContext<ChatsContextValue | undefined>(undefined);

export const ChatsProvider = ({ children, query }: ChatsProviderProps) => {
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
  } = useChatsData(userId, currentAccountId, query);

  const chats = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  useEffect(() => {
    if (data) {
      console.info('[ChatsContext] Chats data fetched:', {
        pageCount: data.pages.length,
        totalChats: chats.length,
      });

      if (chats.length > 0) {
        console.info('[ChatsContext] First chat item:', chats[0]);
        console.info('[ChatsContext] Has participants?', {
          hasParticipants: !!chats[0]?.participants,
          participantCount: chats[0]?.participants?.length ?? 0,
        });
      } else {
        console.info('[ChatsContext] No chats in response');
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
