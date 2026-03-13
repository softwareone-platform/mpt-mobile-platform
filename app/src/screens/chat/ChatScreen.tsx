import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useEffect } from 'react';

import { data } from './chatData';

import ListViewChat from '@/components/list/ListViewChat';
import { useSignalR } from '@/context/SignalRContext';
import { ChatItem } from '@/types/chat';
import type { RootStackParamList } from '@/types/navigation';

const ChatScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const { subscribe, unsubscribe, addMessageListener, isConnected } = useSignalR();

  // TODO Subscribe to chat entities when connected here just for testing purposes, to be removed
  useEffect(() => {
    if (!isConnected) {
      return;
    }

    const subscriptions = [
      { moduleName: 'Helpdesk', entityName: 'Chat' },
      { moduleName: 'Helpdesk', entityName: 'ChatMessage' },
      { moduleName: 'Helpdesk', entityName: 'ChatParticipant' },
    ];

    void subscribe(subscriptions);

    return () => {
      void unsubscribe(subscriptions);
    };
  }, [isConnected, subscribe, unsubscribe]);

  useEffect(() => {
    const removeListener = addMessageListener(() => {
      // Handle incoming messages logic here, to be implemented
    });

    return removeListener;
  }, [addMessageListener]);

  // TODO: warp into loading / error handling component when API is ready
  return (
    <ListViewChat
      data={data as ChatItem[]}
      userId="USR-2267-7838"
      // isFetchingNext={chatsIsFetchingNext}
      // hasMore={hasMoreChats}
      // fetchNext={fetchChats}
      onItemPress={(id) => {
        navigation.navigate('chatConversation', {
          id,
        });
      }}
    />
  );
};

export default ChatScreen;
