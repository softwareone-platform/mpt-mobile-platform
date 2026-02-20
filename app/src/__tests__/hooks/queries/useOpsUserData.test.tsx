import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { useOpsUsersData } from '@/hooks/queries/useOpsUserData';
import type { ListItemFull, PaginatedResponse } from '@/types/api';

const mockGetAllUsers = jest.fn();

jest.mock('@/services/userService', () => ({
  useUserApi: () => ({
    getAllUsers: mockGetAllUsers,
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
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useOpsUsersData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch all users when userId is provided and shouldFetch is true', async () => {
    const mockResponse: PaginatedResponse<ListItemFull> = {
      $meta: {
        pagination: { offset: 0, limit: 50, total: 2 },
      },
      data: [
        { id: 'USR-1', name: 'John Doe', status: 'Active', icon: '/icon1.png' },
        { id: 'USR-2', name: 'Jane Smith', status: 'Invited', icon: '/icon2.png' },
      ],
    };

    mockGetAllUsers.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useOpsUsersData('USR-123', true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockGetAllUsers).toHaveBeenCalledWith(0, 50);
    expect(result.current.data?.pages[0].data).toHaveLength(2);
  });

  it('should not fetch when userId is undefined', async () => {
    const { result } = renderHook(() => useOpsUsersData(undefined, true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockGetAllUsers).not.toHaveBeenCalled();
  });

  it('should not fetch when shouldFetch is false', async () => {
    const { result } = renderHook(() => useOpsUsersData('USR-123', false), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockGetAllUsers).not.toHaveBeenCalled();
  });

  it('should handle API errors', async () => {
    mockGetAllUsers.mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => useOpsUsersData('USR-123', true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockGetAllUsers).toHaveBeenCalled();
  });

  it('should call getAllUsers with pagination params', () => {
    const userId = 'USR-456';
    renderHook(() => useOpsUsersData(userId, true), {
      wrapper: createWrapper(),
    });

    expect(mockGetAllUsers).toHaveBeenCalledWith(0, 50);
  });
});
