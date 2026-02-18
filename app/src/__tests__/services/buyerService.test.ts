import { renderHook, act } from '@testing-library/react-native';

import {
  mockBuyerId1,
  mockBuyerId2,
  mockBuyerData,
  expectedUrl1,
  expectedUrl2,
  mockResponse1,
  mockResponse2,
} from '../__mocks__/services/buyer';
import { mockNetworkError } from '../__mocks__/services/common';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useBuyerApi } from '@/services/buyerService';
import type { PaginatedResponse, ListItemFull } from '@/types/api';

const mockGet = jest.fn();

jest.mock('@/hooks/useApi', () => ({
  useApi: () => ({
    get: mockGet,
  }),
}));

const setup = () => renderHook(() => useBuyerApi()).result.current;

const expectedUrlBase =
  `/v1/accounts/buyers` +
  `?select=-*,id,name,status,icon` +
  `&ne(status,%22Deleted%22)` +
  `&order=name`;

describe('useBuyerApi - getBuyers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getBuyers with default offset and limit', async () => {
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
      res = await api.getBuyers('ACC-0000-0001');
    });

    const expectedUrl =
      expectedUrlBase + `&offset=${DEFAULT_OFFSET}` + `&limit=${DEFAULT_PAGE_SIZE}`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('calls getBuyers with custom offset and limit', async () => {
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
      res = await api.getBuyers('ACC-0000-0001', 50, 25);
    });

    const expectedUrl = expectedUrlBase + `&offset=50` + `&limit=25`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('handles multiple calls correctly', async () => {
    const api = setup();

    const mockResponse1: PaginatedResponse<ListItemFull> = {
      $meta: { pagination: { offset: 0, limit: 2, total: 4 } },
      data: [
        {
          id: 'BUY-1001-5001',
          name: 'Acme Corporation',
          status: 'Active',
          icon: '/path/to/acme-icon.png',
        } as ListItemFull,
        {
          id: 'BUY-1002-5002',
          name: 'TechStart Inc',
          status: 'Active',
          icon: '/path/to/techstart-icon.png',
        } as ListItemFull,
      ],
    };

    const mockResponse2: PaginatedResponse<ListItemFull> = {
      $meta: { pagination: { offset: 2, limit: 2, total: 4 } },
      data: [
        {
          id: 'BUY-1003-5003',
          name: 'Global Solutions Ltd',
          status: 'Pending',
          icon: '/path/to/global-icon.png',
        } as ListItemFull,
        {
          id: 'BUY-1004-5004',
          name: 'Digital Ventures',
          status: 'Active',
          icon: '/path/to/digital-icon.png',
        } as ListItemFull,
      ],
    };

    mockGet.mockResolvedValueOnce(mockResponse1);
    mockGet.mockResolvedValueOnce(mockResponse2);

    let res1: PaginatedResponse<ListItemFull> | undefined;
    let res2: PaginatedResponse<ListItemFull> | undefined;

    await act(async () => {
      res1 = await api.getBuyers('ACC-0000-0001', 0, 2);
    });

    await act(async () => {
      res2 = await api.getBuyers('ACC-0000-0001', 2, 2);
    });

    expect(res1).toBeDefined();
    expect(res1!.data.length).toBe(2);
    expect(res1!.data.map((item) => item.id)).toEqual(['BUY-1001-5001', 'BUY-1002-5002']);
    expect(res1!.data.map((item) => item.name)).toEqual(['Acme Corporation', 'TechStart Inc']);

    expect(res2).toBeDefined();
    expect(res2!.data.length).toBe(2);
    expect(res2!.data.map((item) => item.id)).toEqual(['BUY-1003-5003', 'BUY-1004-5004']);
    expect(res2!.data.map((item) => item.name)).toEqual([
      'Global Solutions Ltd',
      'Digital Ventures',
    ]);
  });

  it('returns correct buyer data structure', async () => {
    const api = setup();
    const mockBuyer: ListItemFull = {
      id: 'BUY-1234-5678',
      name: 'Enterprise Buyer Corp',
      status: 'Active',
      icon: '/path/to/enterprise-icon.png',
    };

    const mockResponse: PaginatedResponse<ListItemFull> = {
      $meta: {
        pagination: {
          offset: 0,
          limit: 10,
          total: 1,
        },
      },
      data: [mockBuyer],
    };

    mockGet.mockResolvedValueOnce(mockResponse);

    let res;
    await act(async () => {
      res = await api.getBuyers('ACC-0000-0001');
    });

    expect(res).toEqual(mockResponse);
    expect(res!.data[0]).toMatchObject({
      id: 'BUY-1234-5678',
      name: 'Enterprise Buyer Corp',
      status: 'Active',
    });
  });

  it('handles API errors correctly', async () => {
    const api = setup();
    const mockError = new Error('Network error');

    mockGet.mockRejectedValueOnce(mockError);

    await expect(api.getBuyers('ACC-0000-0001')).rejects.toThrow('Network error');
  });
});

describe('useBuyerApi - getBuyerData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getBuyerData with correct endpoint and returns data', async () => {
    const api = setup();

    let res;

    mockGet.mockResolvedValueOnce(mockBuyerData);

    await act(async () => {
      res = await api.getBuyerData(mockBuyerId1);
    });

    expect(mockGet).toHaveBeenCalledWith(expectedUrl1);
    expect(res).toEqual(mockBuyerData);
  });

  it('handles API errors correctly', async () => {
    const api = setup();

    mockGet.mockRejectedValueOnce(mockNetworkError);

    await expect(api.getBuyerData(mockBuyerId1)).rejects.toThrow('Network error');
  });

  it('handles multiple calls correctly', async () => {
    const api = setup();

    let res1;
    let res2;

    mockGet.mockResolvedValueOnce(mockResponse1);
    mockGet.mockResolvedValueOnce(mockResponse2);

    await act(async () => {
      res1 = await api.getBuyerData(mockBuyerId1);
    });

    await act(async () => {
      res2 = await api.getBuyerData(mockBuyerId2);
    });

    expect(mockGet).toHaveBeenNthCalledWith(1, expectedUrl1);
    expect(mockGet).toHaveBeenNthCalledWith(2, expectedUrl2);

    expect(res1).toEqual(mockResponse1);
    expect(res2).toEqual(mockResponse2);
  });
});
