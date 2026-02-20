import { renderHook, act } from '@testing-library/react-native';

import { mockNetworkError } from '../__mocks__/services/common';
import {
  mockProductId1,
  mockProductId2,
  expectedProductUrl1,
  expectedProductUrl2,
  mockProductData,
  mockProductResponse1,
  mockProductResponse2,
  mockProductListItem1,
  mockProductListItem2,
  mockProductListItem3,
  mockProductListItem4,
} from '../__mocks__/services/product';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useProductApi } from '@/services/productService';
import type { PaginatedResponse, ListItemFull } from '@/types/api';

const mockGet = jest.fn();

jest.mock('@/hooks/useApi', () => ({
  useApi: () => ({
    get: mockGet,
  }),
}));

const setup = () => renderHook(() => useProductApi()).result.current;

const expectedUrlBase =
  `/v1/catalog/products` +
  `?select=-*,id,name,status,icon` +
  `&ne(status,%22Draft%22)` +
  `&order=name`;

describe('useProductApi - getProducts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getProducts with default offset and limit', async () => {
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
      res = await api.getProducts();
    });

    const expectedUrl =
      expectedUrlBase + `&offset=${DEFAULT_OFFSET}` + `&limit=${DEFAULT_PAGE_SIZE}`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('calls getProducts with custom offset and limit', async () => {
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
      res = await api.getProducts(50, 25);
    });

    const expectedUrl = expectedUrlBase + `&offset=50` + `&limit=25`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('handles multiple calls correctly', async () => {
    const api = setup();

    const mockResponse1: PaginatedResponse<ListItemFull> = {
      $meta: {
        pagination: { offset: 0, limit: 2, total: 4 },
      },
      data: [mockProductListItem1 as ListItemFull, mockProductListItem2 as ListItemFull],
    };
    const mockResponse2: PaginatedResponse<ListItemFull> = {
      $meta: {
        pagination: { offset: 2, limit: 2, total: 4 },
      },
      data: [mockProductListItem3 as ListItemFull, mockProductListItem4 as ListItemFull],
    };

    let res1: PaginatedResponse<ListItemFull> | undefined;
    let res2: PaginatedResponse<ListItemFull> | undefined;

    mockGet.mockResolvedValueOnce(mockResponse1);
    mockGet.mockResolvedValueOnce(mockResponse2);

    await act(async () => {
      res1 = await api.getProducts(0, 2);
    });

    await act(async () => {
      res2 = await api.getProducts(2, 2);
    });

    expect(mockGet).toHaveBeenCalledTimes(2);
    expect(res1).toBeDefined();
    expect(res1!.data.length).toBe(2);
    expect(res1).toEqual(mockResponse1);

    expect(res2).toBeDefined();
    expect(res2!.data.length).toBe(2);
    expect(res2).toEqual(mockResponse2);
  });

  it('handles API errors correctly in getProducts', async () => {
    const api = setup();
    const mockError = new Error('Network error');

    mockGet.mockRejectedValueOnce(mockError);

    await expect(api.getProducts()).rejects.toThrow('Network error');
  });

  it('returns products with correct data structure', async () => {
    const api = setup();
    const mockResponse: PaginatedResponse<ListItemFull> = {
      $meta: {
        pagination: { offset: 0, limit: 10, total: 1 },
      },
      data: [mockProductListItem3],
    };

    mockGet.mockResolvedValueOnce(mockResponse);

    let res: PaginatedResponse<ListItemFull> | undefined;
    await act(async () => {
      res = await api.getProducts();
    });

    expect(res).toEqual(mockResponse);
    expect(res!.data[0]).toMatchObject({
      id: 'PRD-1234-5674',
      name: 'Microsoft Azure',
      icon: '/v1/catalog/products/PRD-1234-5674/icon',
      status: 'Pending',
    });
  });
});

describe('useProductApi - getProductData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getProductData with correct endpoint and returns data', async () => {
    const api = setup();

    let res;

    mockGet.mockResolvedValueOnce(mockProductData);

    await act(async () => {
      res = await api.getProductData(mockProductId1);
    });

    expect(mockGet).toHaveBeenCalledWith(expectedProductUrl1);
    expect(res).toEqual(mockProductData);
  });

  it('handles API errors correctly', async () => {
    const api = setup();

    mockGet.mockRejectedValueOnce(mockNetworkError);

    await expect(api.getProductData(mockProductId1)).rejects.toThrow('Network error');
  });

  it('handles multiple calls correctly', async () => {
    const api = setup();

    let res1;
    let res2;

    mockGet.mockResolvedValueOnce(mockProductResponse1);
    mockGet.mockResolvedValueOnce(mockProductResponse2);

    await act(async () => {
      res1 = await api.getProductData(mockProductId1);
    });

    await act(async () => {
      res2 = await api.getProductData(mockProductId2);
    });

    expect(mockGet).toHaveBeenNthCalledWith(1, expectedProductUrl1);
    expect(mockGet).toHaveBeenNthCalledWith(2, expectedProductUrl2);

    expect(res1).toEqual(mockProductResponse1);
    expect(res2).toEqual(mockProductResponse2);
  });
});
