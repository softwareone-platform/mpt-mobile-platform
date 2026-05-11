import { FlatList, StyleProp, ViewStyle } from 'react-native';

import { usePaginatedListProps } from '@/components/list/usePaginatedListProps';
import ListItemWithStatus from '@/components/list-item/ListItemWithStatus';
import { screenStyle } from '@/styles';
import type { ListItemConfig } from '@/types/lists';
import { mapToListItemProps } from '@/utils/list';

type ListViewProps<T extends { id: string }> = {
  data: T[];
  config: ListItemConfig;
  onItemPress?: (id: string) => void;
  isFetchingNext?: boolean;
  hasMore?: boolean;
  fetchNext?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export function ListView<T extends { id: string }>({
  data,
  config,
  onItemPress,
  isFetchingNext,
  hasMore,
  fetchNext,
  onRefresh,
  isRefreshing,
  contentContainerStyle,
}: ListViewProps<T>) {
  const paginatedProps = usePaginatedListProps({
    isFetchingNext,
    hasMore,
    fetchNext,
    onRefresh,
    isRefreshing,
  });

  if (data.length === 0) return null;

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => String((item as Record<string, unknown>)[config.id])}
      contentContainerStyle={[screenStyle.containerMain, contentContainerStyle]}
      renderItem={({ item, index }) => {
        const isFirst = index === 0;
        const isLast = index === data.length - 1;

        const mapped = mapToListItemProps(item as Record<string, unknown>, config);

        return (
          <ListItemWithStatus
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
}
