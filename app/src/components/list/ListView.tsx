import { FlatList } from 'react-native';

import ListItemWithStatus from '@/components/list-item/ListItemWithStatus';
import { screenStyle } from '@/styles';
import type { ListItemConfig } from '@/types/lists';
import { mapToListItemProps } from '@/utils/list';

type ListViewProps = {
  data: Record<string, unknown>[];
  config: ListItemConfig;
  onItemPress?: (item: Record<string, unknown>) => void;
};

export function ListView({ data, config, onItemPress }: ListViewProps) {
  if (data.length === 0) return null;

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => mapToListItemProps(item, config).id}
      contentContainerStyle={screenStyle.containerMain}
      renderItem={({ item, index }) => {
        const isFirst = index === 0;
        const isLast = index === data.length - 1;

        return (
          <ListItemWithStatus
            {...mapToListItemProps(item, config)}
            isFirst={isFirst}
            isLast={isLast}
            onPress={() => onItemPress?.(item)}
          />
        );
      }}
      showsVerticalScrollIndicator={false}
    />
  );
}
