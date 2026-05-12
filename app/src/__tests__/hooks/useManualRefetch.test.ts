import { renderHook, act } from '@testing-library/react-native';

import { useManualRefetch } from '@/hooks/useManualRefetch';

describe('useManualRefetch', () => {
  it('calls refetchFn and returns true for isManuallyRefetching while refetching', () => {
    const refetchFn = jest.fn();
    const { result, rerender } = renderHook(
      ({ isRefetching }) => useManualRefetch(refetchFn, isRefetching),
      { initialProps: { isRefetching: false } },
    );

    act(() => {
      result.current.refetch();
    });

    rerender({ isRefetching: true });
    expect(refetchFn).toHaveBeenCalledTimes(1);
    expect(result.current.isManuallyRefetching).toBe(true);
  });

  it('resets isManuallyRefetching to false when isRefetching goes false', () => {
    const refetchFn = jest.fn();
    const { result, rerender } = renderHook(
      ({ isRefetching }) => useManualRefetch(refetchFn, isRefetching),
      { initialProps: { isRefetching: false } },
    );

    act(() => {
      result.current.refetch();
    });

    rerender({ isRefetching: true });
    rerender({ isRefetching: false });
    expect(result.current.isManuallyRefetching).toBe(false);
  });

  it('returns false for isManuallyRefetching on background refetch', () => {
    const refetchFn = jest.fn();
    const { result, rerender } = renderHook(
      ({ isRefetching }) => useManualRefetch(refetchFn, isRefetching),
      { initialProps: { isRefetching: false } },
    );

    rerender({ isRefetching: true });
    expect(result.current.isManuallyRefetching).toBe(false);
  });
});
