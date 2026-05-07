import { useCallback, useMemo } from 'react';
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
  const onEndReached = useCallback(() => {
    if (hasMore && !isFetchingNext) {
      fetchNext?.();
    }
  }, [hasMore, isFetchingNext, fetchNext]);

  return useMemo(
    () => ({
      onEndReached,
      onEndReachedThreshold: FLATLIST_END_REACHED_THRESHOLD,
      ListFooterComponent: isFetchingNext ? <ActivityIndicator /> : null,
      showsVerticalScrollIndicator: false,
      refreshControl: onRefresh ? (
        <RefreshControl refreshing={isRefreshing ?? false} onRefresh={onRefresh} />
      ) : undefined,
    }),
    [onEndReached, isFetchingNext, onRefresh, isRefreshing],
  );
}
