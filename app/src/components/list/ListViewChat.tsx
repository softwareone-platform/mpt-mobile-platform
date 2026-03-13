import { useTranslation } from 'react-i18next';
import { FlatList, ActivityIndicator } from 'react-native';

import ListItemChat from '@/components/list-item/ListItemChat';
import { FLATLIST_END_REACHED_THRESHOLD } from '@/constants/api';
import { screenStyle } from '@/styles';
import type { ChatItem } from '@/types/chat';
import { mapToChatListItemProps } from '@/utils/chat';

type Props = {
  userId: string;
  data: ChatItem[];
  onItemPress?: (id: string) => void;
  isFetchingNext?: boolean;
  hasMore?: boolean;
  fetchNext?: () => void;
};

const ListViewChat = ({ userId, data, onItemPress, isFetchingNext, hasMore, fetchNext }: Props) => {
  const { i18n } = useTranslation();

  if (data.length === 0) {
    return null;
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={screenStyle.containerMain}
      renderItem={({ item, index }) => {
        const isFirst = index === 0;
        const isLast = index === data.length - 1;

        const mapped = mapToChatListItemProps(item, i18n.language, userId);

        return (
          <ListItemChat
            {...mapped}
            isFirst={isFirst}
            isLast={isLast}
            onPress={() => onItemPress?.(item.id)}
          />
        );
      }}
      onEndReached={() => {
        if (hasMore && !isFetchingNext) {
          fetchNext?.();
        }
      }}
      onEndReachedThreshold={FLATLIST_END_REACHED_THRESHOLD}
      ListFooterComponent={isFetchingNext ? <ActivityIndicator /> : null}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default ListViewChat;
