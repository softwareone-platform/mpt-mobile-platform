import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';

import { useUsersData } from '@/hooks/queries/useUsersData';
import type { ListItemFull, PaginatedResponse } from '@/types/api';

const mockGetUsers = jest.fn();

jest.mock('@/services/userService', () => ({
  useUserApi: () => ({
    getUsers: mockGetUsers,
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useUsersData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch users when all parameters are provided and shouldFetch is true', async () => {
    const mockResponse: PaginatedResponse<ListItemFull> = {
      $meta: {
        pagination: { offset: 0, limit: 50, total: 2 },
      },
      data: [
        { id: 'USR-1', name: 'John Doe', status: 'Active', icon: '/icon1.png' },
        { id: 'USR-2', name: 'Jane Smith', status: 'Invited', icon: '/icon2.png' },
      ],
    };

    mockGetUsers.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useUsersData('USR-123', 'ACC-456', true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockGetUsers).toHaveBeenCalledWith('ACC-456', 0, 50);
    expect(result.current.data?.pages[0].data).toHaveLength(2);
  });

  it('should fetch users with default shouldFetch value (true)', async () => {
    const mockResponse: PaginatedResponse<ListItemFull> = {
      $meta: {
        pagination: { offset: 0, limit: 50, total: 1 },
      },
      data: [{ id: 'USR-1', name: 'John Doe', status: 'Active', icon: '/icon1.png' }],
    };

    mockGetUsers.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useUsersData('USR-123', 'ACC-456'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockGetUsers).toHaveBeenCalled();
  });

  it('should not fetch when userId is undefined', async () => {
    const { result } = renderHook(() => useUsersData(undefined, 'ACC-456', true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockGetUsers).not.toHaveBeenCalled();
  });

  it('should not fetch when accountId is undefined', async () => {
    const { result } = renderHook(() => useUsersData('USR-123', undefined, true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockGetUsers).not.toHaveBeenCalled();
  });

  it('should not fetch when shouldFetch is false', async () => {
    const { result } = renderHook(() => useUsersData('USR-123', 'ACC-456', false), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockGetUsers).not.toHaveBeenCalled();
  });

  it('should handle API errors', async () => {
    mockGetUsers.mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => useUsersData('USR-123', 'ACC-456', true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockGetUsers).toHaveBeenCalled();
  });

  it('should use correct query key', async () => {
    const userId = 'USR-789';
    const accountId = 'ACC-012';

    const { result } = renderHook(() => useUsersData(userId, accountId, true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeDefined();
  });
});
