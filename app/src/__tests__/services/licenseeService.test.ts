import { renderHook, act } from '@testing-library/react-native';

import { mockNetworkError } from '../__mocks__/services/common';
import {
  mockLicenseeId1,
  mockLicenseeId2,
  mockLicenseeData,
  expectedUrl1,
  expectedUrl2,
  mockResponse1,
  mockResponse2,
} from '../__mocks__/services/licensee';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useLicenseeApi } from '@/services/licenseeService';
import type { PaginatedResponse, ListItemFull } from '@/types/api';

const mockGet = jest.fn();

jest.mock('@/hooks/useApi', () => ({
  useApi: () => ({
    get: mockGet,
  }),
}));

const setup = () => renderHook(() => useLicenseeApi()).result.current;

describe('useLicenseeApi - getLicensees', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getLicensees with default offset and limit', async () => {
    const api = setup();
    const mockResponse: PaginatedResponse<ListItemFull> = {
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
      res = await api.getLicensees('ACC-0000-0001');
    });

    const expectedUrl =
      `/v1/accounts/licensees` +
      `?select=seller,buyer.status` +
      `&eq(account.id,%22ACC-0000-0001%22)` +
      `&order=name` +
      `&offset=${DEFAULT_OFFSET}` +
      `&limit=${DEFAULT_PAGE_SIZE}`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('calls getLicensees with custom offset and limit', async () => {
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
      res = await api.getLicensees('ACC-1234-5678', 50, 25);
    });

    const expectedUrl =
      `/v1/accounts/licensees` +
      `?select=seller,buyer.status` +
      `&eq(account.id,%22ACC-1234-5678%22)` +
      `&order=name` +
      `&offset=50` +
      `&limit=25`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('handles multiple calls correctly', async () => {
    const api = setup();

    const mockResponse1: PaginatedResponse<ListItemFull> = {
      $meta: { pagination: { offset: 0, limit: 2, total: 4 } },
      data: [
        {
          id: 'LCE-2001-8001-0001',
          name: 'Premium Licensee Corp',
          status: 'Active',
          icon: '/path/to/premium-icon.png',
        } as ListItemFull,
        {
          id: 'LCE-2002-8002-0002',
          name: 'Standard Licensee Ltd',
          status: 'Active',
          icon: '/path/to/standard-icon.png',
        } as ListItemFull,
      ],
    };

    const mockResponse2: PaginatedResponse<ListItemFull> = {
      $meta: { pagination: { offset: 2, limit: 2, total: 4 } },
      data: [
        {
          id: 'LCE-2003-8003-0003',
          name: 'Enterprise Licensee Inc',
          status: 'Enabled',
          icon: '/path/to/enterprise-icon.png',
        } as ListItemFull,
        {
          id: 'LCE-2004-8004-0004',
          name: 'Starter Licensee Co',
          status: 'Active',
          icon: '/path/to/starter-icon.png',
        } as ListItemFull,
      ],
    };

    mockGet.mockResolvedValueOnce(mockResponse1);
    mockGet.mockResolvedValueOnce(mockResponse2);

    let res1: PaginatedResponse<ListItemFull> | undefined;
    let res2: PaginatedResponse<ListItemFull> | undefined;

    await act(async () => {
      res1 = await api.getLicensees('ACC-0000-0001', 0, 2);
    });

    await act(async () => {
      res2 = await api.getLicensees('ACC-0000-0001', 2, 2);
    });

    expect(res1).toBeDefined();
    expect(res1!.data.length).toBe(2);

    expect(res1!.data.map((item) => item.id)).toEqual(['LCE-2001-8001-0001', 'LCE-2002-8002-0002']);
    expect(res1!.data.map((item) => item.name)).toEqual([
      'Premium Licensee Corp',
      'Standard Licensee Ltd',
    ]);

    expect(res2).toBeDefined();
    expect(res2!.data.length).toBe(2);
    expect(res2!.data.map((item) => item.id)).toEqual(['LCE-2003-8003-0003', 'LCE-2004-8004-0004']);
    expect(res2!.data.map((item) => item.name)).toEqual([
      'Enterprise Licensee Inc',
      'Starter Licensee Co',
    ]);
  });

  it('returns correct licensee data structure', async () => {
    const api = setup();
    const mockLicensee: ListItemFull = {
      id: 'LCE-7890-1234-0001',
      name: 'Global Licensee Solutions',
      status: 'Active',
      icon: '/path/to/global-licensee-icon.png',
    };

    const mockResponse: PaginatedResponse<ListItemFull> = {
      $meta: {
        pagination: {
          offset: 0,
          limit: 10,
          total: 1,
        },
      },
      data: [mockLicensee],
    };

    mockGet.mockResolvedValueOnce(mockResponse);

    let res;
    await act(async () => {
      res = await api.getLicensees('ACC-0000-0001');
    });

    expect(res).toEqual(mockResponse);
    expect(res!.data[0]).toMatchObject({
      id: 'LCE-7890-1234-0001',
      name: 'Global Licensee Solutions',
      status: 'Active',
    });
  });

  it('handles API errors correctly', async () => {
    const api = setup();
    const mockError = new Error('Network error');

    mockGet.mockRejectedValueOnce(mockError);

    await expect(api.getLicensees('ACC-0000-0001')).rejects.toThrow('Network error');
  });
});

describe('useLicenseeApi - getLicenseeData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getLicenseeData with correct endpoint and returns data', async () => {
    const api = setup();

    let res;

    mockGet.mockResolvedValueOnce(mockLicenseeData);

    await act(async () => {
      res = await api.getLicenseeData(mockLicenseeId1);
    });

    expect(mockGet).toHaveBeenCalledWith(expectedUrl1);
    expect(res).toEqual(mockLicenseeData);
  });

  it('handles API errors correctly', async () => {
    const api = setup();

    mockGet.mockRejectedValueOnce(mockNetworkError);

    await expect(api.getLicenseeData(mockLicenseeId1)).rejects.toThrow('Network error');
  });

  it('handles multiple calls correctly', async () => {
    const api = setup();

    let res1;
    let res2;

    mockGet.mockResolvedValueOnce(mockResponse1);
    mockGet.mockResolvedValueOnce(mockResponse2);

    await act(async () => {
      res1 = await api.getLicenseeData(mockLicenseeId1);
    });

    await act(async () => {
      res2 = await api.getLicenseeData(mockLicenseeId2);
    });

    expect(mockGet).toHaveBeenNthCalledWith(1, expectedUrl1);
    expect(mockGet).toHaveBeenNthCalledWith(2, expectedUrl2);

    expect(res1).toEqual(mockResponse1);
    expect(res2).toEqual(mockResponse2);
  });
});
