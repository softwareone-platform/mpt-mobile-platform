import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { TouchableOpacity, Text } from 'react-native';

import type { RootStackParamList } from '@/types/navigation';

const ChatScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

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
    </TouchableOpacity>
  );
};

export default ChatScreen;
