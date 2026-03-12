import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useEffect } from 'react';
import { TouchableOpacity, Text } from 'react-native';

import { useSignalR } from '@/context/SignalRContext';
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

  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate('chatConversation', {
          id: 'USR-123',
        });
      }}
      activeOpacity={0.7}
    >
      <Text>USR: 123</Text>
      <Text>SignalR: {isConnected ? 'SignalR Connected' : 'SignalR Disconnected'}</Text>
    </TouchableOpacity>
  );
};

export default ChatScreen;
