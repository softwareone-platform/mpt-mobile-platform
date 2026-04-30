import { renderHook, act } from '@testing-library/react-native';

import { mockNetworkError } from '../__mocks__/services/common';
import {
  mockSellerId1,
  mockSellerId2,
  expectedSellerUrl1,
  expectedSellerUrl2,
  mockSellerData,
  mockSellerResponse1,
  mockSellerResponse2,
  mockSellerListId1,
  mockSellerListId2,
  mockSellerListId3,
  mockSellerListId4,
  mockSellerListItem1,
  mockSellerListItem2,
  mockSellerListItem3,
  mockSellerListItem4,
} from '../__mocks__/services/seller';

import { DEFAULT_PAGE_SIZE, DEFAULT_OFFSET } from '@/constants/api';
import { useSellerApi } from '@/services/sellerService';
import type { PaginatedResponse, ListItemFull } from '@/types/api';

const mockGet = jest.fn();

jest.mock('@/hooks/useApi', () => ({
  useApi: () => ({
    get: mockGet,
  }),
}));

const setup = () => renderHook(() => useSellerApi()).result.current;

describe('useSellerApi - getSellerData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getSellerData with correct endpoint and returns data', async () => {
    const api = setup();

    let res;

    mockGet.mockResolvedValueOnce(mockSellerData);

    await act(async () => {
      res = await api.getSellerData(mockSellerId1);
    });

    expect(mockGet).toHaveBeenCalledWith(expectedSellerUrl1);
    expect(res).toEqual(mockSellerData);
  });

  it('handles API errors correctly', async () => {
    const api = setup();

    mockGet.mockRejectedValueOnce(mockNetworkError);

    await expect(api.getSellerData(mockSellerId1)).rejects.toThrow('Network error');
  });

  it('handles multiple calls correctly', async () => {
    const api = setup();

    let res1;
    let res2;

    mockGet.mockResolvedValueOnce(mockSellerResponse1);
    mockGet.mockResolvedValueOnce(mockSellerResponse2);

    await act(async () => {
      res1 = await api.getSellerData(mockSellerId1);
    });

    await act(async () => {
      res2 = await api.getSellerData(mockSellerId2);
    });

    expect(mockGet).toHaveBeenNthCalledWith(1, expectedSellerUrl1);
    expect(mockGet).toHaveBeenNthCalledWith(2, expectedSellerUrl2);

    expect(res1).toEqual(mockSellerResponse1);
    expect(res2).toEqual(mockSellerResponse2);
  });
});

describe('useSellerApi - getSellers', () => {
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
