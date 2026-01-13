import { FlatList, ActivityIndicator } from 'react-native';

import ListItemWithStatus from '@/components/list-item/ListItemWithStatus';
import { screenStyle } from '@/styles';
import type { ListItemConfig } from '@/types/lists';
import { mapToListItemProps } from '@/utils/list';

type ListViewProps<T extends object> = {
  data: T[];
  config: ListItemConfig;
  onItemPress?: (item: T) => void;

  isFetchingNext?: boolean;
  hasMore?: boolean;
  fetchNext?: () => void;
};

export function ListView<T extends object>({
  data,
  config,
  onItemPress,
  isFetchingNext,
  hasMore,
  fetchNext,
}: ListViewProps<T>) {
  if (data.length === 0) return null;

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => String((item as Record<string, unknown>)[config.id])}
      contentContainerStyle={screenStyle.containerMain}
      renderItem={({ item, index }) => {
        const isFirst = index === 0;
        const isLast = index === data.length - 1;

        return (
          <ListItemWithStatus
            {...mapToListItemProps(item as Record<string, unknown>, config)}
            isFirst={isFirst}
            isLast={isLast}
            onPress={() => onItemPress?.(item)}
          />
        );
      }}
      onEndReached={() => {
        if (hasMore && !isFetchingNext) {
          fetchNext?.();
        }
      }}
      onEndReachedThreshold={0.6}
      ListFooterComponent={isFetchingNext ? <ActivityIndicator /> : null}
      showsVerticalScrollIndicator={false}
    />
  );
}
