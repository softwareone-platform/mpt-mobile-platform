import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { TouchableOpacity, Text } from 'react-native';

import type { RootStackParamList } from '@/types/navigation';

const ChatRootScreen = () => {
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
      <Text>USER - 123</Text>
    </TouchableOpacity>
  );
};

export default ChatRootScreen;
