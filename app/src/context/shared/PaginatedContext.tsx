import { createContext, ReactNode, useContext, useMemo } from 'react';

import { useAccount } from '@/context/AccountContext';
import type { PaginatedResponse } from '@/types/api';
import type { InfiniteData } from '@tanstack/react-query';

/**
 * Return type from paginated query hooks (useClientsData, useVendorsData, etc.)
 */
interface PaginatedQueryResult<T> {
  data: InfiniteData<PaginatedResponse<T>> | undefined;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  isError: boolean;
  isUnauthorised: boolean;
  fetchNextPage: () => void;
}

/**
 * Common context value shape for paginated entity contexts.
 */
export interface PaginatedContextValue<T> {
  items: T[];
  isLoading: boolean;
  isFetchingNext: boolean;
  hasMore: boolean;
  isError: boolean;
  isUnauthorised: boolean;
  fetchNextPage: () => void;
}

type UseDataHook<T> = (
  userId: string | undefined,
  currentAccountId: string | undefined,
) => PaginatedQueryResult<T>;

interface CreatePaginatedContextOptions<T> {
  useDataHook: UseDataHook<T>;
  contextName: string;
}

/**
 * Factory for creating paginated context providers.
 *
 * Eliminates boilerplate for contexts that:
 * - Extract userId and currentAccountId from AccountContext
 * - Use a paginated query hook
 * - Expose flattened data with loading/error states
 *
 * @example
 * ```typescript
 * const { Provider: ClientsProvider, useContextHook: useClients } =
 *   createPaginatedContext({
 *     useDataHook: useClientsData,
 *     contextName: 'Clients',
 *   });
 * ```
 */
export function createPaginatedContext<T>({
  useDataHook,
  contextName,
}: CreatePaginatedContextOptions<T>) {
  const Context = createContext<PaginatedContextValue<T> | undefined>(undefined);

  const Provider = ({ children }: { children: ReactNode }) => {
    const { userData } = useAccount();

    const userId = userData?.id;
    const currentAccountId = userData?.currentAccount?.id;

    const {
      data,
      isLoading,
      isFetchingNextPage,
      hasNextPage,
      isError,
      isUnauthorised,
      fetchNextPage,
    } = useDataHook(userId, currentAccountId);

    const items = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

    const value = useMemo(
      () => ({
        items,
        isLoading,
        isFetchingNext: isFetchingNextPage,
        hasMore: !!hasNextPage,
        isError,
        isUnauthorised,
        fetchNextPage,
      }),
      [items, isLoading, isFetchingNextPage, hasNextPage, isError, isUnauthorised, fetchNextPage],
    );

    return <Context.Provider value={value}>{children}</Context.Provider>;
  };

  const useContextHook = (): PaginatedContextValue<T> => {
    const context = useContext(Context);
    if (!context) {
      throw new Error(`use${contextName} must be used inside ${contextName}Provider`);
    }
    return context;
  };

  return { Provider, useContextHook };
}
