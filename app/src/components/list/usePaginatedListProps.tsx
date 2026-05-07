import { ActivityIndicator } from 'react-native';

import RefreshControl from '@/components/common/RefreshControl';
import { FLATLIST_END_REACHED_THRESHOLD } from '@/constants/api';

type Params = {
  isFetchingNext?: boolean;
  hasMore?: boolean;
  fetchNext?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
};

export function usePaginatedListProps({
  isFetchingNext,
  hasMore,
  fetchNext,
  onRefresh,
  isRefreshing,
}: Params) {
  return {
    onEndReached: () => {
      if (hasMore && !isFetchingNext) {
        fetchNext?.();
      }
    },
    onEndReachedThreshold: FLATLIST_END_REACHED_THRESHOLD,
    ListFooterComponent: isFetchingNext ? <ActivityIndicator /> : null,
    showsVerticalScrollIndicator: false,
    refreshControl: onRefresh ? (
      <RefreshControl refreshing={isRefreshing ?? false} onRefresh={onRefresh} />
    ) : undefined,
  };
}
