import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { data } from './chatData';

import ListViewChat from '@/components/list/ListViewChat';
import { ChatItem } from '@/types/chat';
import type { RootStackParamList } from '@/types/navigation';

const ChatScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

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
