import { FlatList, ActivityIndicator } from 'react-native';

import ListItemWithStatus from '@/components/list-item/ListItemWithStatus';
import { FLATLIST_END_REACHED_THRESHOLD } from '@/constants/api';
import { screenStyle } from '@/styles';
import type { ListItemConfig, ListItemWithStatusProps } from '@/types/lists';
import { mapToListItemProps } from '@/utils/list';

type ListViewProps<T extends object> = {
  data: T[];
  config: ListItemConfig;
  onItemPress?: (item: ListItemWithStatusProps) => void;
  testIdPrefix?: string;

  isFetchingNext?: boolean;
  hasMore?: boolean;
  fetchNext?: () => void;
};

export function ListView<T extends object>({
  data,
  config,
  onItemPress,
  testIdPrefix,
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

        const mapped = mapToListItemProps(item as Record<string, unknown>, config);

        return (
          <ListItemWithStatus
            {...mapped}
            isFirst={isFirst}
            isLast={isLast}
            onPress={() => onItemPress?.(mapped)}
            testID={testIdPrefix ? `${testIdPrefix}-${mapped.id}` : undefined}
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
}
