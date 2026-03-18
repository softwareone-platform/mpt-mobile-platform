import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import ListViewChat from '@/components/list/ListViewChat';
import CreateChatButton from '@/components/navigation/CreateChatButton';
import { useAccount } from '@/context/AccountContext';
import { useChats, ChatsProvider } from '@/context/ChatsContext';
import { useSignalR } from '@/context/SignalRContext';
import CreateChatModal from '@/screens/chat/CreateChatModal';
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

  const [isCreateChatVisible, setCreateChatVisible] = useState(false);

  const { userData } = useAccount();
  const userId = userData?.id;
  const currentAccountId = userData?.currentAccount?.id;

  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { subscribe, addMessageListener, isConnected } = useSignalR();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <CreateChatButton onPress={() => setCreateChatVisible(true)} />,
    });
  }, [navigation]);

  useEffect(() => {
    void subscribe(CHAT_SUBSCRIPTIONS);
  }, [subscribe, isConnected]);

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

  useFocusEffect(
    useCallback(() => {
      if (userId && currentAccountId) {
        void queryClient.invalidateQueries({
          queryKey: ['chats', userId, currentAccountId],
        });
      }
    }, [queryClient, userId, currentAccountId]),
  );

  // TODO: warp into loading / error handling component when API is ready
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
      <CreateChatModal visible={isCreateChatVisible} onClose={() => setCreateChatVisible(false)} />
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
