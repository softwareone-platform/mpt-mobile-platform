import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import ListViewChat from '@/components/list/ListViewChat';
import { useAccount } from '@/context/AccountContext';
import { useChats, ChatsProvider } from '@/context/ChatsContext';
import { useSignalR } from '@/context/SignalRContext';
import type { RootStackParamList } from '@/types/navigation';
import type { EntitySubscription } from '@/types/signalr';
import { TestIDs } from '@/utils/testID';

const CHAT_SUBSCRIPTIONS: EntitySubscription[] = [
  { moduleName: 'Helpdesk', entityName: 'Chat' },
  { moduleName: 'Helpdesk', entityName: 'ChatMessage' },
  { moduleName: 'Helpdesk', entityName: 'ChatParticipant' },
];

const ChatScreenContent = () => {
  const {
    chats,
    chatsLoading,
    chatsError,
    chatsFetchingNext,
    hasMoreChats,
    isUnauthorised,
    fetchChats,
  } = useChats();

  const { userData } = useAccount();
  const userId = userData?.id;
  const currentAccountId = userData?.currentAccount?.id;

  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { subscribe, addMessageListener } = useSignalR();

  useEffect(() => {
    void subscribe(CHAT_SUBSCRIPTIONS);
  }, [subscribe]);

  useEffect(() => {
    const removeListener = addMessageListener((message) => {
      if (message.entity === 'Chat' || message.entity === 'ChatMessage') {
        void queryClient.invalidateQueries({
          queryKey: ['chats', userId, currentAccountId],
        });
      }
    });

    return removeListener;
  }, [addMessageListener, queryClient, userId, currentAccountId]);

  return (
    <StatusMessage
      isLoading={chatsLoading}
      isError={!!chatsError}
      isEmpty={chats.length === 0}
      isUnauthorised={isUnauthorised}
      loadingTestId={TestIDs.CHATS_LOADING_INDICATOR}
      errorTestId={TestIDs.CHATS_ERROR_STATE}
      emptyTestId={TestIDs.CHATS_EMPTY_STATE}
      emptyTitle={t('chatsScreen.emptyStateTitle')}
      emptyDescription={t('chatsScreen.emptyStateDescription')}
    >
      <ListViewChat
        userId={userId || ''}
        data={chats}
        isFetchingNext={chatsFetchingNext}
        hasMore={hasMoreChats}
        fetchNext={fetchChats}
        onItemPress={(id) => {
          navigation.navigate('chatConversation', {
            id,
          });
        }}
      />
    </StatusMessage>
  );
};

const ChatScreen = () => {
  return (
    <ChatsProvider>
      <ChatScreenContent />
    </ChatsProvider>
  );
};

export default ChatScreen;
