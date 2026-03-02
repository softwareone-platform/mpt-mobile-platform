import { RouteProp, useRoute } from '@react-navigation/native';
import { Text } from 'react-native';

import type { RootStackParamList } from '@/types/navigation';

type ChatConversationRouteProp = RouteProp<RootStackParamList, 'chatConversation'>;

const ChatConversationScreen = () => {
  const { id } = useRoute<ChatConversationRouteProp>().params;

  return <Text>Chat for user {id}</Text>;
};

export default ChatConversationScreen;
