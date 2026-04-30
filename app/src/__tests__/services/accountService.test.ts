import { renderHook, act } from '@testing-library/react-native';
jest.mock('@/services/loggerService', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

import {
  mockClientItem1,
  mockClientItem2,
  mockClientId1,
  mockClientId2,
  mockClientId3,
  mockClientId4,
  mockClientItem3,
  mockClientItem4,
} from '../__mocks__/services/client';
import { mockNetworkError } from '../__mocks__/services/common';
import {
  mockSellerListId1,
  mockSellerListId2,
  mockSellerListId3,
  mockSellerListId4,
  mockSellerListItem1,
  mockSellerListItem2,
  mockSellerListItem3,
  mockSellerListItem4,
} from '../__mocks__/services/seller';
import {
  mockVendorId1,
  mockVendorId2,
  mockVendorId3,
  mockVendorId4,
  mockVendorItem1,
  mockVendorItem2,
  mockVendorItem3,
  mockVendorItem4,
} from '../__mocks__/services/vendor';

import { DEFAULT_PAGE_SIZE, DEFAULT_OFFSET, DEFAULT_SPOTLIGHT_LIMIT } from '@/constants/api';
import { useAccountApi } from '@/services/accountService';
import { logger } from '@/services/loggerService';
import type { PaginatedResponse, ListItemFull } from '@/types/api';

const mockGet = jest.fn();
const mockPut = jest.fn();
const mockRefreshAuth = jest.fn();

jest.mock('@/hooks/useApi', () => ({
  useApi: () => ({
    get: mockGet,
    put: mockPut,
  }),
}));

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    refreshAuth: mockRefreshAuth,
  }),
}));

const setup = () => renderHook(() => useAccountApi()).result.current;

describe('useAccountApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getUserData correctly', async () => {
    const api = setup();
    mockGet.mockResolvedValueOnce({ id: '123' });

    let res;
    await act(async () => {
      res = await api.getUserData('123');
    });

    expect(mockGet).toHaveBeenCalledWith('/v1/accounts/users/123');
    expect(res).toEqual({ id: '123' });
  });

  it('calls getCurrentAccountIcon correctly', async () => {
    const api = setup();
    mockGet.mockResolvedValueOnce({ currentAccount: { icon: 'icon.png' } });

    let res;
    await act(async () => {
      res = await api.getCurrentAccountIcon('999');
    });

    expect(mockGet).toHaveBeenCalledWith('/v1/accounts/users/999?select=currentAccount.icon');
    expect(res).toEqual({ currentAccount: { icon: 'icon.png' } });
  });

  it('calls getAllUserAccounts correctly', async () => {
    const api = setup();
    mockGet.mockResolvedValueOnce([{ id: '1' }]);

    let res;
    await act(async () => {
      res = await api.getAllUserAccounts('777');
    });

    expect(mockGet).toHaveBeenCalledWith('/v1/accounts/users/777/accounts');
    expect(res).toEqual([{ id: '1' }]);
  });

  it('calls getUserAccountsData with defaults', async () => {
    const api = setup();
    mockGet.mockResolvedValueOnce({ data: [] });

    let res;
    await act(async () => {
      res = await api.getUserAccountsData('555');
    });

    const expectedUrl =
      `/v1/accounts/users/555/accounts` +
      `?select=id,name,type,status,icon,favorite,audit.access.at,-*` +
      `&eq(invitation.status,"Active")` +
      `&order=name` +
      `&offset=${DEFAULT_OFFSET}` +
      `&limit=${DEFAULT_PAGE_SIZE}`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual({ data: [] });
  });

  it('calls getUserAccountsData with explicit offset and limit', async () => {
    const api = setup();
    mockGet.mockResolvedValueOnce({ data: [] });

    let res;
    await act(async () => {
      res = await api.getUserAccountsData('555', 10, 20);
    });

    const expectedUrl =
      `/v1/accounts/users/555/accounts` +
      `?select=id,name,type,status,icon,favorite,audit.access.at,-*` +
      `&eq(invitation.status,"Active")` +
      `&order=name` +
      `&offset=10` +
      `&limit=20`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual({ data: [] });
  });

  it('calls getSpotlightData with DEFAULT_SPOTLIGHT_LIMIT', async () => {
    const api = setup();
    mockGet.mockResolvedValueOnce({ top: [] });

    let res;
    await act(async () => {
      res = await api.getSpotlightData(); // uses 100
    });

    expect(mockGet).toHaveBeenCalledWith(
      `/v1/spotlight/objects?select=query.filter,top&limit=${DEFAULT_SPOTLIGHT_LIMIT}`,
    );
    expect(res).toEqual({ top: [] });
  });

  it('calls getSpotlightData with custom limit', async () => {
    const api = setup();
    mockGet.mockResolvedValueOnce({ top: [] });

    let res;
    await act(async () => {
      res = await api.getSpotlightData(12);
    });

    expect(mockGet).toHaveBeenCalledWith(`/v1/spotlight/objects?select=query.filter,top&limit=12`);
    expect(res).toEqual({ top: [] });
  });

  it('calls getSubscriptionsData with defaults', async () => {
    const api = setup();
    mockGet.mockResolvedValueOnce([{ id: 'sub1' }]);

    let res;
    await act(async () => {
      res = await api.getSubscriptionsData();
    });

    const expectedUrl =
      `/v1/commerce/subscriptions?filter(group.buyers)` +
      `&offset=${DEFAULT_OFFSET}` +
      `&limit=${DEFAULT_PAGE_SIZE}`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual([{ id: 'sub1' }]);
  });

  it('calls getSubscriptionsData with custom values', async () => {
    const api = setup();
    mockGet.mockResolvedValueOnce([{ id: 'sub2' }]);

    let res;
    await act(async () => {
      res = await api.getSubscriptionsData(5, 10);
    });

    const expectedUrl =
      `/v1/commerce/subscriptions?filter(group.buyers)` + `&offset=5` + `&limit=10`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual([{ id: 'sub2' }]);
  });

  it('calls switchAccount and refreshAuth', async () => {
    const api = setup();
    mockPut.mockResolvedValueOnce(undefined);
    mockRefreshAuth.mockResolvedValueOnce(undefined);

    await act(async () => {
      await api.switchAccount('100', '200');
    });

    expect(mockPut).toHaveBeenCalledWith('/v1/accounts/users/100', {
      currentAccount: { id: '200' },
    });

    expect(mockRefreshAuth).toHaveBeenCalled();
  });

  it('throws when switching account without userId', async () => {
    const api = setup();

    await expect(
      act(async () => {
        await api.switchAccount('', '200');
      }),
    ).rejects.toThrow('User ID is required to switch accounts');

    expect(mockPut).not.toHaveBeenCalled();
  });

  it('logs warning when refreshAuth fails after account switch', async () => {
    const api = setup();

    mockPut.mockResolvedValueOnce(undefined);
    mockRefreshAuth.mockRejectedValueOnce(new Error('Refresh failed'));

    await act(async () => {
      await api.switchAccount('100', '200');
    });

    expect(mockPut).toHaveBeenCalledWith('/v1/accounts/users/100', {
      currentAccount: { id: '200' },
    });

    expect(logger.warn).toHaveBeenCalledWith('Failed to refresh token after account switch', {
      operation: 'switchAccount',
    });
  });

  it('calls getAccountData correctly', async () => {
    const api = setup();
    mockGet.mockResolvedValueOnce({ id: 'acc-123' });

    let res;
    await act(async () => {
      res = await api.getAccountData('acc-123');
    });

    expect(mockGet).toHaveBeenCalledWith('/v1/accounts/accounts/acc-123?select=audit,groups');
    expect(res).toEqual({ id: 'acc-123' });
  });

  it('throws when getAccountData fails', async () => {
    const api = setup();
    const error = new Error('API failure');
    mockGet.mockRejectedValueOnce(error);

    await expect(
      act(async () => {
        await api.getAccountData('acc-999');
      }),
    ).rejects.toThrow('API failure');

    expect(mockGet).toHaveBeenCalledWith('/v1/accounts/accounts/acc-999?select=audit,groups');
  });
});

describe('useAccountApi - getClients', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const expectedUrlBase =
    `/v1/accounts/accounts` +
    `?select=-*,id,name,status,icon` +
    '&eq(type,%22Client%22)' +
    '&order=name';

  it('getClients - calls with default offset and limit', async () => {
    const api = setup();
    const mockEmptyResponse: PaginatedResponse<ListItemFull> = {
      $meta: {
        pagination: {
          offset: DEFAULT_OFFSET,
          limit: DEFAULT_PAGE_SIZE,
          total: 0,
        },
      },
      data: [],
    };
    mockGet.mockResolvedValueOnce(mockEmptyResponse);

    let res;
    await act(async () => {
      res = await api.getClients();
    });

    const expectedUrl =
      expectedUrlBase + `&offset=${DEFAULT_OFFSET}` + `&limit=${DEFAULT_PAGE_SIZE}`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockEmptyResponse);
  });

  it('getClients - calls with custom offset and limit', async () => {
    const api = setup();

    const mockClientsMultipleResponse: PaginatedResponse<ListItemFull> = {
      $meta: {
        pagination: {
          offset: DEFAULT_OFFSET,
          limit: DEFAULT_PAGE_SIZE,
          total: 2,
        },
      },
      data: [mockClientItem1, mockClientItem2],
    };
    mockGet.mockResolvedValueOnce(mockClientsMultipleResponse);

    let res;
    await act(async () => {
      res = await api.getClients(50, 25);
    });

    const expectedUrl = expectedUrlBase + `&offset=50` + `&limit=25`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockClientsMultipleResponse);
  });

  it('getClients - handles multiple calls correctly', async () => {
    const api = setup();

    const mockResponse1: PaginatedResponse<ListItemFull> = {
      $meta: { pagination: { offset: 0, limit: 2, total: 4 } },
      data: [mockClientItem1 as ListItemFull, mockClientItem2 as ListItemFull],
    };

    const mockResponse2: PaginatedResponse<ListItemFull> = {
      $meta: { pagination: { offset: 2, limit: 2, total: 4 } },
      data: [mockClientItem3 as ListItemFull, mockClientItem4 as ListItemFull],
    };

    mockGet.mockResolvedValueOnce(mockResponse1);
    mockGet.mockResolvedValueOnce(mockResponse2);

    let res1: PaginatedResponse<ListItemFull> | undefined;
    let res2: PaginatedResponse<ListItemFull> | undefined;

    await act(async () => {
      res1 = await api.getClients(0, 2);
    });

    await act(async () => {
      res2 = await api.getClients(2, 2);
    });

    expect(res1).toBeDefined();
    expect(res1!.data.length).toBe(2);
    expect(res1!.data.map((item) => item.id)).toEqual([mockClientId1, mockClientId2]);
    expect(res1!.data.map((item) => item.name)).toEqual([
      mockClientItem1.name,
      mockClientItem2.name,
    ]);

    expect(res2).toBeDefined();
    expect(res2!.data.length).toBe(2);
    expect(res2!.data.map((item) => item.id)).toEqual([mockClientId3, mockClientId4]);
    expect(res2!.data.map((item) => item.name)).toEqual([
      mockClientItem3.name,
      mockClientItem4.name,
    ]);
  });

  it('getClients - returns correct client data structure', async () => {
    const api = setup();

    const mockResponse: PaginatedResponse<ListItemFull> = {
      $meta: {
        pagination: {
          offset: 0,
          limit: 10,
          total: 1,
        },
      },
      data: [mockClientItem1],
    };

    mockGet.mockResolvedValueOnce(mockResponse);

    let res;
    await act(async () => {
      res = await api.getClients();
    });

    expect(res).toEqual(mockResponse);
    expect(res!.data[0]).toMatchObject({
      id: mockClientItem1.id,
      name: mockClientItem1.name,
      status: mockClientItem1.status,
      icon: mockClientItem1.icon,
    });
  });

  it('getClients - handles API errors correctly', async () => {
    const api = setup();

    mockGet.mockRejectedValueOnce(mockNetworkError);

    await expect(api.getClients()).rejects.toThrow('Network error');
  });
});

describe('useAccountApi - getVendors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const expectedUrlBase =
    `/v1/accounts/accounts` +
    `?select=-*,id,name,status,icon` +
    '&eq(type,%22Vendor%22)' +
    `&order=name`;

  it('calls getVendors with default offset and limit', async () => {
    const api = setup();

    const mockEmptyResponse: PaginatedResponse<ListItemFull> = {
      $meta: {
        pagination: {
          offset: DEFAULT_OFFSET,
          limit: DEFAULT_PAGE_SIZE,
          total: 0,
        },
      },
      data: [],
    };

    mockGet.mockResolvedValueOnce(mockEmptyResponse);

    let res;
    await act(async () => {
      res = await api.getVendors();
    });

    const expectedUrl =
      expectedUrlBase + `&offset=${DEFAULT_OFFSET}` + `&limit=${DEFAULT_PAGE_SIZE}`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockEmptyResponse);
  });

  it('calls getVendors with custom offset and limit', async () => {
    const api = setup();

    const mockVendorsMultipleResponse: PaginatedResponse<ListItemFull> = {
      $meta: {
        pagination: {
          offset: DEFAULT_OFFSET,
          limit: DEFAULT_PAGE_SIZE,
          total: 2,
        },
      },
      data: [mockVendorItem1, mockVendorItem2],
    };
    mockGet.mockResolvedValueOnce(mockVendorsMultipleResponse);

    let res;
    await act(async () => {
      res = await api.getVendors(50, 25);
    });

    const expectedUrl = expectedUrlBase + `&offset=50` + `&limit=25`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockVendorsMultipleResponse);
  });

  it('handles multiple calls correctly', async () => {
    const api = setup();

    const mockResponse1: PaginatedResponse<ListItemFull> = {
      $meta: { pagination: { offset: 0, limit: 2, total: 4 } },
      data: [mockVendorItem1 as ListItemFull, mockVendorItem2 as ListItemFull],
    };

    const mockResponse2: PaginatedResponse<ListItemFull> = {
      $meta: { pagination: { offset: 2, limit: 2, total: 4 } },
      data: [mockVendorItem3 as ListItemFull, mockVendorItem4 as ListItemFull],
    };

    mockGet.mockResolvedValueOnce(mockResponse1);
    mockGet.mockResolvedValueOnce(mockResponse2);

    let res1: PaginatedResponse<ListItemFull> | undefined;
    let res2: PaginatedResponse<ListItemFull> | undefined;

    await act(async () => {
      res1 = await api.getVendors(0, 2);
    });

    await act(async () => {
      res2 = await api.getVendors(2, 2);
    });

    expect(res1!.data.map((item) => item.id)).toEqual([mockVendorId1, mockVendorId2]);
    expect(res1!.data.map((item) => item.name)).toEqual([
      mockVendorItem1.name,
      mockVendorItem2.name,
    ]);

    expect(res2).toBeDefined();
    expect(res2!.data.length).toBe(2);
    expect(res2!.data.map((item) => item.id)).toEqual([mockVendorId3, mockVendorId4]);
    expect(res2!.data.map((item) => item.name)).toEqual([
      mockVendorItem3.name,
      mockVendorItem4.name,
    ]);
  });

  it('returns correct vendor data structure', async () => {
    const api = setup();

    const mockSingleResponse: PaginatedResponse<ListItemFull> = {
      $meta: {
        pagination: {
          offset: 0,
          limit: 10,
          total: 1,
        },
      },
      data: [mockVendorItem1],
    };
    mockGet.mockResolvedValueOnce(mockSingleResponse);

    let res;
    await act(async () => {
      res = await api.getVendors();
    });

    expect(res).toEqual(mockSingleResponse);
    expect(res!.data[0]).toMatchObject({
      id: mockVendorItem1.id,
      name: mockVendorItem1.name,
      status: mockVendorItem1.status,
      icon: mockVendorItem1.icon,
    });
  });

  it('handles API errors correctly', async () => {
    const api = setup();

    mockGet.mockRejectedValueOnce(mockNetworkError);

    await expect(api.getVendors()).rejects.toThrow('Network error');
  });
});

describe('useAccountApi - getSellers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const expectedUrlBase = `/v1/accounts/sellers` + `?select=id,name,status,icon` + '&order=name';

  it('calls getSellers with default offset and limit', async () => {
    const api = setup();

    const mockEmptyResponse: PaginatedResponse<ListItemFull> = {
      $meta: {
        pagination: {
          offset: DEFAULT_OFFSET,
          limit: DEFAULT_PAGE_SIZE,
          total: 0,
        },
      },
      data: [],
    };

    mockGet.mockResolvedValueOnce(mockEmptyResponse);

    let res;
    await act(async () => {
      res = await api.getSellers();
    });

    const expectedUrl =
      expectedUrlBase + `&offset=${DEFAULT_OFFSET}` + `&limit=${DEFAULT_PAGE_SIZE}`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockEmptyResponse);
  });

  it('calls getSellers with custom offset and limit', async () => {
    const api = setup();

    const mockSellersMultipleResponse: PaginatedResponse<ListItemFull> = {
      $meta: {
        pagination: {
          offset: 50,
          limit: 25,
          total: 2,
        },
      },
      data: [mockSellerListItem1, mockSellerListItem2],
    };

    mockGet.mockResolvedValueOnce(mockSellersMultipleResponse);

    let res;
    await act(async () => {
      res = await api.getSellers(50, 25);
    });

    const expectedUrl = expectedUrlBase + `&offset=50` + `&limit=25`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockSellersMultipleResponse);
  });

  it('handles multiple calls correctly with 2 items per page', async () => {
    const api = setup();

    const mockResponse1: PaginatedResponse<ListItemFull> = {
      $meta: { pagination: { offset: 0, limit: 2, total: 4 } },
      data: [mockSellerListItem1 as ListItemFull, mockSellerListItem2 as ListItemFull],
    };

    const mockResponse2: PaginatedResponse<ListItemFull> = {
      $meta: { pagination: { offset: 2, limit: 2, total: 4 } },
      data: [mockSellerListItem3 as ListItemFull, mockSellerListItem4 as ListItemFull],
    };

    mockGet.mockResolvedValueOnce(mockResponse1);
    mockGet.mockResolvedValueOnce(mockResponse2);

    let res1: PaginatedResponse<ListItemFull> | undefined;
    let res2: PaginatedResponse<ListItemFull> | undefined;

    await act(async () => {
      res1 = await api.getSellers(0, 2);
    });

    await act(async () => {
      res2 = await api.getSellers(2, 2);
    });

    expect(res1).toBeDefined();
    expect(res1!.data.length).toBe(2);
    expect(res1!.data.map((item) => item.id)).toEqual([mockSellerListId1, mockSellerListId2]);
    expect(res1!.data.map((item) => item.status)).toEqual(['Active', 'Disabled']);

    expect(res2).toBeDefined();
    expect(res2!.data.length).toBe(2);
    expect(res2!.data.map((item) => item.id)).toEqual([mockSellerListId3, mockSellerListId4]);
    expect(res2!.data.map((item) => item.status)).toEqual(['Offline', 'Deleted']);
  });

  it('returns correct seller data structure', async () => {
    const api = setup();

    const mockSingleResponse: PaginatedResponse<ListItemFull> = {
      $meta: {
        pagination: {
          offset: 0,
          limit: 10,
          total: 1,
        },
      },
      data: [mockSellerListItem1],
    };

    mockGet.mockResolvedValueOnce(mockSingleResponse);

    let res;
    await act(async () => {
      res = await api.getSellers();
    });

    expect(res).toEqual(mockSingleResponse);
    expect(res!.data[0]).toMatchObject({
      id: mockSellerListItem1.id,
      name: mockSellerListItem1.name,
      status: mockSellerListItem1.status,
      icon: mockSellerListItem1.icon,
    });
  });

  it('handles API errors correctly', async () => {
    const api = setup();

    mockGet.mockRejectedValueOnce(mockNetworkError);

    await expect(api.getSellers()).rejects.toThrow('Network error');
  });
});

describe('useAccountApi - getAccountsForUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUserId = 'USR-1960-6520';

  const expectedBaseUrl =
    `/v1/accounts/users/${mockUserId}/accounts` + `?select=groups,audit` + `&order=name`;

  it('calls with default offset and limit', async () => {
    const api = setup();
    mockGet.mockResolvedValueOnce({ data: [] });

    let res;
    await act(async () => {
      res = await api.getAccountsForUser(mockUserId);
    });

    const expectedUrl =
      expectedBaseUrl + `&offset=${DEFAULT_OFFSET}` + `&limit=${DEFAULT_PAGE_SIZE}`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual({ data: [] });
  });

  it('calls with custom offset and limit', async () => {
    const api = setup();
    mockGet.mockResolvedValueOnce({ data: [] });

    let res;
    await act(async () => {
      res = await api.getAccountsForUser(mockUserId, 10, 5);
    });

    expect(mockGet).toHaveBeenCalledWith(expectedBaseUrl + `&offset=10` + `&limit=5`);
    expect(res).toEqual({ data: [] });
  });

  it('handles API errors correctly', async () => {
    const api = setup();
    mockGet.mockRejectedValueOnce(mockNetworkError);

    await expect(api.getAccountsForUser(mockUserId)).rejects.toThrow('Network error');
  });
});
