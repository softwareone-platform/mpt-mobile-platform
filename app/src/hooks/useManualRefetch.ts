import { useCallback, useEffect, useRef } from 'react';

export function useManualRefetch(refetchFn: () => void, isRefetching: boolean) {
  const isManualRefreshingRef = useRef(false);

  useEffect(() => {
    if (!isRefetching) {
      isManualRefreshingRef.current = false;
    }
  }, [isRefetching]);

  const refetch = useCallback(() => {
    isManualRefreshingRef.current = true;
    refetchFn();
  }, [refetchFn]);

  return {
    refetch,
    isManuallyRefetching: isRefetching && isManualRefreshingRef.current,
  };
}
