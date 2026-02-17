import { renderHook, act } from '@testing-library/react-native';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useOrderApi } from '@/services/orderService';
import type { PaginatedResponse, ListItemNoImageNoSubtitle } from '@/types/api';

const mockGet = jest.fn();

jest.mock('@/hooks/useApi', () => ({
  useApi: () => ({
    get: mockGet,
  }),
}));

const setup = () => renderHook(() => useOrderApi()).result.current;

describe('useOrderApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getOrders with default offset and limit', async () => {
    const api = setup();
    const mockResponse: PaginatedResponse<ListItemNoImageNoSubtitle> = {
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
      res = await api.getOrders();
    });

    const expectedUrl =
      `/v1/commerce/orders` +
      `?select=-*,id,status` +
      `&filter(group.buyers)` +
      `&order=-audit.created.at` +
      `&offset=${DEFAULT_OFFSET}` +
      `&limit=${DEFAULT_PAGE_SIZE}`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('calls getOrders with custom offset and limit', async () => {
    const api = setup();
    const mockResponse: PaginatedResponse<ListItemNoImageNoSubtitle> = {
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
      res = await api.getOrders(50, 25);
    });

    const expectedUrl =
      `/v1/commerce/orders` +
      `?select=-*,id,status` +
      `&filter(group.buyers)` +
      `&order=-audit.created.at` +
      `&offset=50` +
      `&limit=25`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('handles multiple calls correctly', async () => {
    const api = setup();

    const mockResponse1: PaginatedResponse<ListItemNoImageNoSubtitle> = {
      $meta: { pagination: { offset: 0, limit: 2, total: 4 } },
      data: [
        {
          id: 'ORD-1234-7564-9753',
          status: 'Completed',
        },
        {
          id: 'ORD-1234-7564-9777',
          status: 'Completed',
        },
      ],
    };

    const mockResponse2: PaginatedResponse<ListItemNoImageNoSubtitle> = {
      $meta: { pagination: { offset: 2, limit: 2, total: 4 } },
      data: [
        {
          id: 'ORD-1234-7564-8799',
          status: 'Deleted',
        },
        {
          id: 'ORD-1234-7564-8777',
          status: 'Failed',
        },
      ],
    };

    mockGet.mockResolvedValueOnce(mockResponse1);
    mockGet.mockResolvedValueOnce(mockResponse2);

    let res1: PaginatedResponse<ListItemNoImageNoSubtitle> | undefined;
    let res2: PaginatedResponse<ListItemNoImageNoSubtitle> | undefined;

    await act(async () => {
      res1 = await api.getOrders(0, 2);
    });

    await act(async () => {
      res2 = await api.getOrders(2, 2);
    });

    expect(res1).toBeDefined();
    expect(res1!.data.length).toBe(2);
    expect(res1!.data.map((item) => item.id)).toEqual(['ORD-1234-7564-9753', 'ORD-1234-7564-9777']);
    expect(res1!.data.map((item) => item.status)).toEqual(['Completed', 'Completed']);

    expect(res2).toBeDefined();
    expect(res2!.data.length).toBe(2);
    expect(res2!.data.map((item) => item.id)).toEqual(['ORD-1234-7564-8799', 'ORD-1234-7564-8777']);
    expect(res2!.data.map((item) => item.status)).toEqual(['Deleted', 'Failed']);
  });

  it('returns correct order data structure', async () => {
    const api = setup();
    const mockOrder: ListItemNoImageNoSubtitle = {
      id: 'ORD-1234-7564-9753',
      status: 'Completed',
    };

    const mockResponse: PaginatedResponse<ListItemNoImageNoSubtitle> = {
      $meta: {
        pagination: {
          offset: 0,
          limit: 10,
          total: 1,
        },
      },
      data: [mockOrder],
    };

    mockGet.mockResolvedValueOnce(mockResponse);

    let res;
    await act(async () => {
      res = await api.getOrders();
    });

    expect(res).toEqual(mockResponse);
    expect(res!.data[0]).toMatchObject({
      id: 'ORD-1234-7564-9753',
      status: 'Completed',
    });
  });

  it('handles API errors correctly', async () => {
    const api = setup();
    const mockError = new Error('Network error');

    mockGet.mockRejectedValueOnce(mockError);

    await expect(api.getOrders()).rejects.toThrow('Network error');
  });
});
