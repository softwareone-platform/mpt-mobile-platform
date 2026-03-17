import { useInfiniteQuery, InfiniteData } from '@tanstack/react-query';

import { DEFAULT_PAGE_SIZE } from '@/constants/api';
import type { PaginatedResponse } from '@/types/api';
import { isUnauthorisedError } from '@/utils/apiError';

interface UsePaginatedQueryParams<T> {
  queryKey: readonly unknown[];
  queryFn: (offset: number, limit: number) => Promise<PaginatedResponse<T>>;
  enabled?: boolean;
  pageSize?: number;
}

export function usePaginatedQuery<T>({
  queryKey,
  queryFn,
  enabled = true,
  pageSize = DEFAULT_PAGE_SIZE,
}: UsePaginatedQueryParams<T>) {
  const query = useInfiniteQuery<
    PaginatedResponse<T>,
    Error,
    InfiniteData<PaginatedResponse<T>>,
    readonly unknown[],
    number
  >({
    queryKey,
    queryFn: ({ pageParam = 0 }) => queryFn(pageParam, pageSize),

    getNextPageParam: (lastPage) => {
      const { offset, limit, total } = lastPage.$meta.pagination;
      const nextOffset = offset + limit;

      if (total !== undefined) {
        return nextOffset < total ? nextOffset : undefined;
      }

      const receivedCount = lastPage.data?.length ?? 0;
      return receivedCount === limit ? nextOffset : undefined;
    },

    initialPageParam: 0,
    enabled,
  });

  return {
    ...query,
    isUnauthorised: isUnauthorisedError(query.error),
  };
}
