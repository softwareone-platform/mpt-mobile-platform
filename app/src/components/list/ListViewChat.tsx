import { useTranslation } from 'react-i18next';
import { FlatList } from 'react-native';

import { usePaginatedListProps } from '@/components/list/usePaginatedListProps';
import ListItemChat from '@/components/list-item/ListItemChat';
import { screenStyle } from '@/styles';
import type { ChatItem } from '@/types/chat';
import type { AccountType } from '@/types/common';
import { mapToChatListItemProps } from '@/utils/chat';

type Props = {
  userId: string;
  accountType?: AccountType;
  data: ChatItem[];
  onItemPress?: (id: string) => void;
  isFetchingNext?: boolean;
  hasMore?: boolean;
  fetchNext?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
};

const ListViewChat = ({
  userId,
  accountType,
  data,
  onItemPress,
  isFetchingNext,
  hasMore,
  fetchNext,
  onRefresh,
  isRefreshing,
}: Props) => {
  const { i18n } = useTranslation();
  const paginatedProps = usePaginatedListProps({
    isFetchingNext,
    hasMore,
    fetchNext,
    onRefresh,
    isRefreshing,
  });

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

        const mapped = mapToChatListItemProps(item, i18n.language, userId, accountType);

        return (
          <ListItemChat
            {...mapped}
            isFirst={isFirst}
            isLast={isLast}
            onPress={() => onItemPress?.(item.id)}
          />
        );
      }}
      {...paginatedProps}
    />
  );
};

export default ListViewChat;
