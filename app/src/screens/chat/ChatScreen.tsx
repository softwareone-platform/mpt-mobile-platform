import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useEffect } from 'react';
import { TouchableOpacity, Text } from 'react-native';

import { useSignalR } from '@/context/SignalRContext';
import type { RootStackParamList } from '@/types/navigation';

const ChatScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { subscribe, addMessageListener, isConnected } = useSignalR();

  // TODO Subscribe to chat entities when connected here just for testing purposes, to be removed
  useEffect(() => {
    if (!isConnected) {
      return;
    }

    void subscribe([
      { moduleName: 'Helpdesk', entityName: 'Chat' },
      { moduleName: 'Helpdesk', entityName: 'ChatMessage' },
      { moduleName: 'Helpdesk', entityName: 'ChatParticipant' },
    ]);
  }, [isConnected, subscribe]);

  useEffect(() => {
    const unsubscribe = addMessageListener((message) => {
      // Handle incoming messages logic here, for now just logging to console
      console.info('Received a new SignalR message', message.data);
    });

    return unsubscribe;
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
