import { renderHook, act } from '@testing-library/react-native';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useBillingApi } from '@/services/billingService';
import type { PaginatedResponse, ListItemNoImageNoSubtitle } from '@/types/api';

const mockGet = jest.fn();

jest.mock('@/hooks/useApi', () => ({
  useApi: () => ({
    get: mockGet,
  }),
}));

const setup = () => renderHook(() => useBillingApi()).result.current;

describe('useBillingApi - Statements', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getStatements with default offset and limit', async () => {
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
      res = await api.getStatements();
    });

    const expectedUrl =
      `/v1/billing/statements` +
      `?select=-*,id,status` +
      `&filter(group.buyers)` +
      `&order=-audit.created.at` +
      `&offset=${DEFAULT_OFFSET}` +
      `&limit=${DEFAULT_PAGE_SIZE}`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('calls getStatements with custom offset and limit', async () => {
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
      res = await api.getStatements(50, 25);
    });

    const expectedUrl =
      `/v1/billing/statements` +
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
        { id: 'SOM-1234-7564-9753-3487', status: 'Issued' },
        { id: 'SOM-1234-7564-9753-3486', status: 'Generated' },
      ],
    };

    const mockResponse2: PaginatedResponse<ListItemNoImageNoSubtitle> = {
      $meta: { pagination: { offset: 2, limit: 2, total: 4 } },
      data: [
        { id: 'SOM-1234-7564-9753-3485', status: 'Generated' },
        { id: 'SOM-1234-7564-9753-3484', status: 'Issued' },
      ],
    };

    mockGet.mockResolvedValueOnce(mockResponse1);
    mockGet.mockResolvedValueOnce(mockResponse2);

    let res1: PaginatedResponse<ListItemNoImageNoSubtitle> | undefined;
    let res2: PaginatedResponse<ListItemNoImageNoSubtitle> | undefined;

    await act(async () => {
      res1 = await api.getStatements(0, 2);
    });

    await act(async () => {
      res2 = await api.getStatements(2, 2);
    });

    expect(res1).toBeDefined();
    expect(res1!.data.length).toBe(2);
    expect(res1!.data.map((item) => item.id)).toEqual([
      'SOM-1234-7564-9753-3487',
      'SOM-1234-7564-9753-3486',
    ]);

    expect(res2).toBeDefined();
    expect(res2!.data.length).toBe(2);
    expect(res2!.data.map((item) => item.id)).toEqual([
      'SOM-1234-7564-9753-3485',
      'SOM-1234-7564-9753-3484',
    ]);
  });

  it('returns statements with correct structure', async () => {
    const api = setup();
    const mockStatement: ListItemNoImageNoSubtitle = {
      id: 'SOM-1234-7564-9753-3487',
      status: 'Issued'
    };

    const mockResponse: PaginatedResponse<ListItemNoImageNoSubtitle> = {
      $meta: {
        pagination: {
          offset: 0,
          limit: 10,
          total: 1,
        },
      },
      data: [mockStatement],
    };

    mockGet.mockResolvedValueOnce(mockResponse);

    let res: PaginatedResponse<ListItemNoImageNoSubtitle> | undefined;
    await act(async () => {
      res = await api.getStatements();
    });

    expect(res).toBeDefined();
    expect(res!.data[0]).toEqual(mockStatement);
    expect(res!.data[0].id).toBe('SOM-1234-7564-9753-3487');
    expect(res!.data[0].status).toBe('Issued');
  });

  it('handles API errors correctly', async () => {
    const api = setup();
    const mockError = new Error('Network error');

    mockGet.mockRejectedValueOnce(mockError);

    await expect(api.getStatements()).rejects.toThrow('Network error');
  });
});
