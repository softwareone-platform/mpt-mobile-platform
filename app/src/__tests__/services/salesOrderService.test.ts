import { renderHook, act } from '@testing-library/react-native';

import {
  mockSalesOrderId1,
  mockSalesOrderId2,
  mockSalesOrderData,
  mockSalesOrderResponse1,
  mockSalesOrderResponse2,
} from '../__mocks__/services/salesOrder';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useSalesOrderApi } from '@/services/salesOrderService';
import type { PaginatedResponse, ListItemNoImageWithExternalIds } from '@/types/api';

const mockGet = jest.fn();

jest.mock('@/hooks/useApi', () => ({
  useApi: () => ({
    get: mockGet,
  }),
}));

const setup = () => renderHook(() => useSalesOrderApi()).result.current;

const expectedUrlBase = `/v1/procurement/sales-orders?select=-*,id,externalIds.operations,status`;

describe('useSalesOrderApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getSalesOrders with default offset and limit', async () => {
    const api = setup();

    const mockResponse: PaginatedResponse<ListItemNoImageWithExternalIds> = {
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
      res = await api.getSalesOrders();
    });

    const expectedUrl =
      expectedUrlBase +
      `&order=-audit.created.at` +
      `&offset=${DEFAULT_OFFSET}` +
      `&limit=${DEFAULT_PAGE_SIZE}`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('calls getSalesOrders with custom offset and limit', async () => {
    const api = setup();

    const mockResponse: PaginatedResponse<ListItemNoImageWithExternalIds> = {
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
      res = await api.getSalesOrders(50, 25);
    });

    const expectedUrl = expectedUrlBase + `&order=-audit.created.at` + `&offset=50` + `&limit=25`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('handles multiple calls correctly', async () => {
    const api = setup();

    const mockResponse1: PaginatedResponse<ListItemNoImageWithExternalIds> = {
      $meta: { pagination: { offset: 0, limit: 2, total: 4 } },
      data: [
        {
          id: 'SOR-7839-0957-0317',
          status: 'Ready',
          externalIds: {
            operations: 'US-SCO-1668259',
          },
        },
        {
          id: 'SOR-9568-0315-3598',
          status: 'Error',
          externalIds: {
            operations: 'US-SCO-1597874',
          },
        },
      ],
    };

    const mockResponse2: PaginatedResponse<ListItemNoImageWithExternalIds> = {
      $meta: { pagination: { offset: 2, limit: 2, total: 4 } },
      data: [
        {
          id: 'SOR-1111-2222-3333',
          status: 'Processing',
          externalIds: {
            operations: 'US-SCO-0000001',
          },
        },
        {
          id: 'SOR-4444-5555-6666',
          status: 'Completed',
          externalIds: {
            operations: 'US-SCO-0000002',
          },
        },
      ],
    };

    mockGet.mockResolvedValueOnce(mockResponse1);
    mockGet.mockResolvedValueOnce(mockResponse2);

    let res1: PaginatedResponse<ListItemNoImageWithExternalIds> | undefined;
    let res2: PaginatedResponse<ListItemNoImageWithExternalIds> | undefined;

    await act(async () => {
      res1 = await api.getSalesOrders(0, 2);
    });

    await act(async () => {
      res2 = await api.getSalesOrders(2, 2);
    });

    expect(res1).toBeDefined();
    expect(res1!.data.length).toBe(2);
    expect(res1!.data.map((item) => item.id)).toEqual(['SOR-7839-0957-0317', 'SOR-9568-0315-3598']);

    expect(res2).toBeDefined();
    expect(res2!.data.length).toBe(2);
    expect(res2!.data.map((item) => item.id)).toEqual(['SOR-1111-2222-3333', 'SOR-4444-5555-6666']);
  });

  it('returns correct sales order data structure', async () => {
    const api = setup();

    const mockOrder: ListItemNoImageWithExternalIds = {
      id: 'SOR-7839-0957-0317',
      status: 'Ready',
      externalIds: {
        operations: 'US-SCO-1668259',
      },
    };

    const mockResponse: PaginatedResponse<ListItemNoImageWithExternalIds> = {
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
      res = await api.getSalesOrders();
    });

    expect(res).toEqual(mockResponse);
    expect(res!.data[0]).toMatchObject({
      id: 'SOR-7839-0957-0317',
      status: 'Ready',
      externalIds: {
        operations: 'US-SCO-1668259',
      },
    });
  });

  it('handles API errors correctly', async () => {
    const api = setup();

    const mockError = new Error('Network error');

    mockGet.mockRejectedValueOnce(mockError);

    await expect(api.getSalesOrders()).rejects.toThrow('Network error');
  });
});

describe('useSalesOrderApi - getSalesOrders with optional query', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getSalesOrders with custom query', async () => {
    const api = setup();

    const customQuery = '&filter=status=Ready&order=status';

    const mockResponse: PaginatedResponse<ListItemNoImageWithExternalIds> = {
      $meta: {
        pagination: {
          offset: 0,
          limit: DEFAULT_PAGE_SIZE,
          total: 0,
        },
      },
      data: [],
    };

    mockGet.mockResolvedValueOnce(mockResponse);

    let res;
    await act(async () => {
      res = await api.getSalesOrders(undefined, undefined, customQuery);
    });

    const expectedUrl =
      `/v1/procurement/sales-orders` +
      `?select=-*,id,externalIds.operations,status` +
      `${customQuery}` +
      `&offset=${DEFAULT_OFFSET}` +
      `&limit=${DEFAULT_PAGE_SIZE}`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('falls back to default query when none provided', async () => {
    const api = setup();

    const mockResponse: PaginatedResponse<ListItemNoImageWithExternalIds> = {
      $meta: {
        pagination: {
          offset: 0,
          limit: DEFAULT_PAGE_SIZE,
          total: 0,
        },
      },
      data: [],
    };

    mockGet.mockResolvedValueOnce(mockResponse);

    let res;
    await act(async () => {
      res = await api.getSalesOrders();
    });

    const expectedUrl =
      `/v1/procurement/sales-orders` +
      `?select=-*,id,externalIds.operations,status` +
      `&order=-audit.created.at` +
      `&offset=${DEFAULT_OFFSET}` +
      `&limit=${DEFAULT_PAGE_SIZE}`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('throws error when API rejects due to invalid query', async () => {
    const api = setup();

    const invalidQuery = 'INVALID_QUERY_STRING';
    const mockError = new Error('Invalid query');

    mockGet.mockRejectedValueOnce(mockError);

    await expect(api.getSalesOrders(undefined, undefined, invalidQuery)).rejects.toThrow(
      'Invalid query',
    );

    const expectedUrl =
      `/v1/procurement/sales-orders` +
      `?select=-*,id,externalIds.operations,status` +
      `${invalidQuery}` +
      `&offset=${DEFAULT_OFFSET}` +
      `&limit=${DEFAULT_PAGE_SIZE}`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
  });

  const expectedSalesOrderUrl1 = `/v1/procurement/sales-orders/${mockSalesOrderId1}?select=vendors,products`;

  const expectedSalesOrderUrl2 = `/v1/procurement/sales-orders/${mockSalesOrderId2}?select=vendors,products`;

  it('getSalesOrderDetails - calls with correct endpoint and returns data required for details view', async () => {
    const api = setup();

    let res;

    mockGet.mockResolvedValueOnce(mockSalesOrderData);

    await act(async () => {
      res = await api.getSalesOrderDetails(mockSalesOrderId1);
    });

    expect(mockGet).toHaveBeenCalledWith(expectedSalesOrderUrl1);
    expect(res).toEqual(mockSalesOrderData);
  });

  it('getSalesOrderDetails - handles API errors correctly', async () => {
    const api = setup();
    const mockError = new Error('Network error');

    mockGet.mockRejectedValueOnce(mockError);

    await expect(api.getSalesOrderDetails(mockSalesOrderId1)).rejects.toThrow('Network error');
  });

  it('getSalesOrderDetails - handles multiple calls correctly', async () => {
    const api = setup();

    let res1;
    let res2;

    mockGet.mockResolvedValueOnce(mockSalesOrderResponse1);
    mockGet.mockResolvedValueOnce(mockSalesOrderResponse2);

    await act(async () => {
      res1 = await api.getSalesOrderDetails(mockSalesOrderId1);
    });

    await act(async () => {
      res2 = await api.getSalesOrderDetails(mockSalesOrderId2);
    });

    expect(mockGet).toHaveBeenNthCalledWith(1, expectedSalesOrderUrl1);

    expect(mockGet).toHaveBeenNthCalledWith(2, expectedSalesOrderUrl2);

    expect(res1).toEqual(mockSalesOrderResponse1);
    expect(res2).toEqual(mockSalesOrderResponse2);
  });
});
