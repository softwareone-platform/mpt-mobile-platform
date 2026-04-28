import { FlatList, ActivityIndicator } from 'react-native';

import RefreshControl from '@/components/common/RefreshControl';
import ListItemWithStatus from '@/components/list-item/ListItemWithStatus';
import { FLATLIST_END_REACHED_THRESHOLD } from '@/constants/api';
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
      onEndReached={() => {
        if (hasMore && !isFetchingNext) {
          fetchNext?.();
        }
      }}
      onEndReachedThreshold={FLATLIST_END_REACHED_THRESHOLD}
      ListFooterComponent={isFetchingNext ? <ActivityIndicator /> : null}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={isRefreshing ?? false} onRefresh={onRefresh} />
        ) : undefined
      }
    />
  );
}
