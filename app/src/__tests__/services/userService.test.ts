import { renderHook, act } from '@testing-library/react-native';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useUserApi } from '@/services/userService';
import type { PaginatedResponse, ListItemFull, User, UserData, SsoStatus } from '@/types/api';

const mockGet = jest.fn();

jest.mock('@/hooks/useApi', () => ({
  useApi: () => ({
    get: mockGet,
  }),
}));

const setup = () => renderHook(() => useUserApi()).result.current;

const expectedUrlBase = (accountId: string) =>
  `v1/accounts/accounts/${accountId}/users` + `?select=id,name,status,icon` + `&order=name`;

describe('useUserApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getUsers with default offset and limit', async () => {
    const api = setup();
    const mockResponse: PaginatedResponse<User> = {
      $meta: {
        pagination: {
          offset: DEFAULT_OFFSET,
          limit: DEFAULT_PAGE_SIZE,
          total: 0,
        },
      },
      data: [],
    };

    mockGet.mockResolvedValueOnce(mockResponse);

    let res;
    await act(async () => {
      res = await api.getUsers('ACC-0000-0001');
    });

    const expectedUrl =
      expectedUrlBase('ACC-0000-0001') +
      `&offset=${DEFAULT_OFFSET}` +
      `&limit=${DEFAULT_PAGE_SIZE}`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('calls getUsers with custom offset and limit', async () => {
    const api = setup();
    const mockResponse: PaginatedResponse<ListItemFull> = {
      $meta: {
        pagination: {
          offset: 50,
          limit: 25,
          total: 100,
        },
      },
      data: [],
    };

    mockGet.mockResolvedValueOnce(mockResponse);

    let res;
    await act(async () => {
      res = await api.getUsers('ACC-0000-0001', 50, 25);
    });

    const expectedUrl = expectedUrlBase('ACC-0000-0001') + `&offset=50` + `&limit=25`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('handles multiple calls correctly', async () => {
    const api = setup();

    const mockResponse1: PaginatedResponse<ListItemFull> = {
      $meta: { pagination: { offset: 0, limit: 2, total: 4 } },
      data: [
        {
          id: 'USR-1',
          name: 'John Doe',
          status: 'Active',
          icon: '/path/to/icon1.png',
        },
        {
          id: 'USR-2',
          name: 'Jane Smith',
          status: 'Invited',
          icon: '/path/to/icon2.png',
        },
      ],
    };

    const mockResponse2: PaginatedResponse<ListItemFull> = {
      $meta: { pagination: { offset: 2, limit: 2, total: 4 } },
      data: [
        {
          id: 'USR-3',
          name: 'Bob Johnson',
          status: 'Active',
          icon: '/path/to/icon3.png',
        },
        {
          id: 'USR-4',
          name: 'Alice Williams',
          status: 'New',
          icon: '/path/to/icon4.png',
        },
      ],
    };

    mockGet.mockResolvedValueOnce(mockResponse1);
    mockGet.mockResolvedValueOnce(mockResponse2);

    let res1: PaginatedResponse<ListItemFull> | undefined;
    let res2: PaginatedResponse<ListItemFull> | undefined;

    await act(async () => {
      res1 = await api.getUsers('ACC-0000-0001', 0, 2);
    });

    await act(async () => {
      res2 = await api.getUsers('ACC-0000-0001', 2, 2);
    });

    expect(res1).toBeDefined();
    expect(res1!.data.length).toBe(2);
    expect(res1!.data.map((item) => item.id)).toEqual(['USR-1', 'USR-2']);
    expect(res1!.data.map((item) => item.name)).toEqual(['John Doe', 'Jane Smith']);

    expect(res2).toBeDefined();
    expect(res2!.data.length).toBe(2);
    expect(res2!.data.map((item) => item.id)).toEqual(['USR-3', 'USR-4']);
    expect(res2!.data.map((item) => item.name)).toEqual(['Bob Johnson', 'Alice Williams']);
  });

  it('returns correct user data structure', async () => {
    const api = setup();
    const mockUser: User = {
      id: 'USR-123',
      name: 'Test User',
      status: 'Active',
      icon: '/path/to/icon.png',
      email: 'test@example.com',
      accounts: [
        {
          id: 'ACC-1',
          name: 'Account 1',
          type: 'Client',
        },
      ],
      audit: {
        created: {
          at: '2026-01-01T10:00:00.000Z',
        },
        updated: {
          at: '2026-01-15T14:30:00.000Z',
        },
      },
    };

    const mockResponse: PaginatedResponse<ListItemFull> = {
      $meta: {
        pagination: {
          offset: 0,
          limit: 10,
          total: 1,
        },
      },
      data: [mockUser],
    };

    mockGet.mockResolvedValueOnce(mockResponse);

    let res;
    await act(async () => {
      res = await api.getUsers('ACC-0000-0001');
    });

    expect(res).toEqual(mockResponse);
    expect(res!.data[0]).toMatchObject({
      id: 'USR-123',
      name: 'Test User',
      status: 'Active',
      email: 'test@example.com',
    });
  });

  it('handles API errors correctly', async () => {
    const api = setup();
    const mockError = new Error('Network error');

    mockGet.mockRejectedValueOnce(mockError);

    await expect(api.getUsers('ACC-0000-0001')).rejects.toThrow('Network error');
  });

  it('calls getAllUsers with default parameters', async () => {
    const api = setup();
    const mockResponse: PaginatedResponse<ListItemFull> = {
      $meta: {
        pagination: {
          offset: DEFAULT_OFFSET,
          limit: DEFAULT_PAGE_SIZE,
          total: 2,
        },
      },
      data: [
        { id: 'USR-1', name: 'John Doe', status: 'Active', icon: '/icon1.png' },
        { id: 'USR-2', name: 'Jane Smith', status: 'Invited', icon: '/icon2.png' },
      ],
    };

    mockGet.mockResolvedValueOnce(mockResponse);

    let res;
    await act(async () => {
      res = await api.getAllUsers();
    });

    const expectedUrl =
      `v1/accounts/users` +
      `?select=-*,id,name,status,icon` +
      `&order=name` +
      `&offset=${DEFAULT_OFFSET}` +
      `&limit=${DEFAULT_PAGE_SIZE}`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('calls getAllUsers with custom offset and limit', async () => {
    const api = setup();
    const mockResponse: PaginatedResponse<ListItemFull> = {
      $meta: {
        pagination: {
          offset: 100,
          limit: 50,
          total: 200,
        },
      },
      data: [],
    };

    mockGet.mockResolvedValueOnce(mockResponse);

    let res;
    await act(async () => {
      res = await api.getAllUsers(100, 50);
    });

    const expectedUrl =
      `v1/accounts/users` +
      `?select=-*,id,name,status,icon` +
      `&order=name` +
      `&offset=100` +
      `&limit=50`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('handles API error in getAllUsers', async () => {
    const api = setup();
    const mockError = new Error('Failed to fetch all users');

    mockGet.mockRejectedValueOnce(mockError);

    await expect(api.getAllUsers()).rejects.toThrow('Failed to fetch all users');
  });

  it('calls getUserData with correct endpoint and returns user data', async () => {
    const api = setup();
    const userId = 'USR-123';
    const expectedUrl = `/v1/accounts/users/${userId}?select=audit,accounts`;
    const mockUser: UserData = {
      id: userId,
      name: 'John Doe',
      email: 'john@example.com',
    };

    let res;

    mockGet.mockResolvedValueOnce(mockUser);

    await act(async () => {
      res = await api.getUserData(userId);
    });

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockUser);
  });

  it('handles API error in getUserData', async () => {
    const api = setup();
    const userId = 'USR-123';
    const expectedUrl = `/v1/accounts/users/${userId}?select=audit,accounts`;
    const mockError = new Error('Failed to fetch user data');

    mockGet.mockRejectedValueOnce(mockError);

    await expect(api.getUserData(userId)).rejects.toThrow('Failed to fetch user data');

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
  });

  it('handles multiple getUserData calls correctly', async () => {
    const api = setup();
    const userId1 = 'USR-123';
    const userId2 = 'USR-234';
    const mockUser1: User = {
      id: 'USR-123',
      name: 'John Doe',
      email: 'john.doe@example.com',
    };
    const mockUser2: UserData = {
      id: 'USR-234',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
    };
    const expectedUrl1 = `/v1/accounts/users/${userId1}?select=audit,accounts`;
    const expectedUrl2 = `/v1/accounts/users/${userId2}?select=audit,accounts`;

    let res1;
    let res2;

    mockGet.mockResolvedValueOnce(mockUser1);
    mockGet.mockResolvedValueOnce(mockUser2);

    await act(async () => {
      res1 = await api.getUserData(userId1);
    });

    await act(async () => {
      res2 = await api.getUserData(userId2);
    });

    expect(mockGet).toHaveBeenNthCalledWith(1, expectedUrl1);
    expect(mockGet).toHaveBeenNthCalledWith(2, expectedUrl2);

    expect(res1).toEqual(mockUser1);
    expect(res2).toEqual(mockUser2);
  });

  it('calls getSsoStatus with correct endpoint and returns SSO status', async () => {
    const api = setup();
    const userId = 'USR-456';
    const expectedUrl = `/v1/accounts/users/${userId}/sso`;
    const mockSsoStatus: SsoStatus = {
      status: 'enabled',
    };

    let res;

    mockGet.mockResolvedValueOnce(mockSsoStatus);

    await act(async () => {
      res = await api.getSsoStatus(userId);
    });

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockSsoStatus);
  });

  it('handles multiple getSsoStatus calls correctly', async () => {
    const api = setup();
    const mockEnabled: SsoStatus = { status: 'enabled' };
    const mockDisabled: SsoStatus = { status: 'disabled' };
    const userId1 = 'USR-123';
    const userId2 = 'USR-234';
    const expectedUrl1 = `/v1/accounts/users/${userId1}/sso`;
    const expectedUrl2 = `/v1/accounts/users/${userId2}/sso`;

    let res1;
    let res2;

    mockGet.mockResolvedValueOnce(mockEnabled);
    mockGet.mockResolvedValueOnce(mockDisabled);

    await act(async () => {
      res1 = await api.getSsoStatus(userId1);
    });

    await act(async () => {
      res2 = await api.getSsoStatus(userId2);
    });

    expect(mockGet).toHaveBeenNthCalledWith(1, expectedUrl1);
    expect(mockGet).toHaveBeenNthCalledWith(2, expectedUrl2);

    expect(res1).toEqual(mockEnabled);
    expect(res2).toEqual(mockDisabled);
  });

  describe('useUserApi - getAllUsers with custom query', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should call getAllUsers with a valid custom query', async () => {
      const api = setup();
      const customQuery = '&order=status&filter=status=Active';
      const mockResponse: PaginatedResponse<User> = {
        $meta: { pagination: { offset: 0, limit: 50, total: 0 } },
        data: [],
      };

      mockGet.mockResolvedValueOnce(mockResponse);

      let res;
      await act(async () => {
        res = await api.getAllUsers(undefined, undefined, customQuery);
      });

      const expectedUrl =
        `v1/accounts/users` +
        `?select=-*,id,name,status,icon` +
        `${customQuery}` +
        `&offset=${DEFAULT_OFFSET}` +
        `&limit=${DEFAULT_PAGE_SIZE}`;

      expect(mockGet).toHaveBeenCalledWith(expectedUrl);
      expect(res).toEqual(mockResponse);
    });

    it('should call getAllUsers with empty string query and fallback to default order', async () => {
      const api = setup();
      const emptyQuery = '';
      const mockResponse: PaginatedResponse<User> = {
        $meta: { pagination: { offset: 0, limit: 50, total: 0 } },
        data: [],
      };

      mockGet.mockResolvedValueOnce(mockResponse);

      let res;
      await act(async () => {
        res = await api.getAllUsers(undefined, undefined, emptyQuery);
      });

      const expectedUrl =
        `v1/accounts/users` +
        `?select=-*,id,name,status,icon` +
        `&order=name` +
        `&offset=${DEFAULT_OFFSET}` +
        `&limit=${DEFAULT_PAGE_SIZE}`;

      expect(mockGet).toHaveBeenCalledWith(expectedUrl);
      expect(res).toEqual(mockResponse);
    });

    it('should throw an error when API rejects due to malformed query', async () => {
      const api = setup();
      const invalidQuery = 'INVALID_QUERY_STRING';
      const mockError = new Error('Invalid query');

      mockGet.mockRejectedValueOnce(mockError);

      await expect(api.getAllUsers(undefined, undefined, invalidQuery)).rejects.toThrow(
        'Invalid query',
      );

      const expectedUrl =
        `v1/accounts/users` +
        `?select=-*,id,name,status,icon` +
        `${invalidQuery}` +
        `&offset=${DEFAULT_OFFSET}` +
        `&limit=${DEFAULT_PAGE_SIZE}`;

      expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    });
  });
});
