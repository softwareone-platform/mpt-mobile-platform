import { renderHook, act } from '@testing-library/react-native';

import { DEBOUNCE_DELAY_MS } from '@/constants/common';
import { useDebounce } from '@/hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial'));

    expect(result.current).toBe('initial');
  });

  it('does not update the value before the delay has elapsed', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: 'first' },
    });

    rerender({ value: 'second' });
    jest.advanceTimersByTime(DEBOUNCE_DELAY_MS - 1);

    expect(result.current).toBe('first');
  });

  it('updates the value after the delay has elapsed', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: 'first' },
    });

    rerender({ value: 'second' });

    act(() => {
      jest.advanceTimersByTime(DEBOUNCE_DELAY_MS);
    });

    expect(result.current).toBe('second');
  });

  it('resets the timer when the value changes before the delay elapses', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: 'first' },
    });

    rerender({ value: 'second' });
    jest.advanceTimersByTime(DEBOUNCE_DELAY_MS - 1);

    rerender({ value: 'third' });
    jest.advanceTimersByTime(DEBOUNCE_DELAY_MS - 1);

    expect(result.current).toBe('first');

    act(() => {
      jest.advanceTimersByTime(1);
    });

    expect(result.current).toBe('third');
  });

  it('respects a custom delay', () => {
    const customDelay = 500;
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, customDelay), {
      initialProps: { value: 'first' },
    });

    rerender({ value: 'second' });
    jest.advanceTimersByTime(DEBOUNCE_DELAY_MS);
    expect(result.current).toBe('first');

    act(() => {
      jest.advanceTimersByTime(customDelay - DEBOUNCE_DELAY_MS);
    });

    expect(result.current).toBe('second');
  });
});
