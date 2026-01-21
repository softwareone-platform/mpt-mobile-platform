import { renderHook, act } from '@testing-library/react-native';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useBillingApi } from '@/services/billingService';
import type { PaginatedResponse } from '@/types/api';
import type { Invoice } from '@/types/billing';

const mockGet = jest.fn();

jest.mock('@/hooks/useApi', () => ({
  useApi: () => ({
    get: mockGet,
  }),
}));

const setup = () => renderHook(() => useBillingApi()).result.current;

describe('useBillingApi - Invoices', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getInvoices with default offset and limit', async () => {
    const api = setup();
    const mockResponse: PaginatedResponse<Invoice> = {
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
      res = await api.getInvoices();
    });

    const expectedUrl =
      `/v1/billing/invoices` +
      `?select=-*,id,status,audit.created.at` +
      `&filter(group.buyers)` +
      `&order=-audit.created.at` +
      `&offset=${DEFAULT_OFFSET}` +
      `&limit=${DEFAULT_PAGE_SIZE}`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('calls getInvoices with custom offset and limit', async () => {
    const api = setup();
    const mockResponse: PaginatedResponse<Invoice> = {
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
      res = await api.getInvoices(50, 25);
    });

    const expectedUrl =
      `/v1/billing/invoices` +
      `?select=-*,id,status,audit.created.at` +
      `&filter(group.buyers)` +
      `&order=-audit.created.at` +
      `&offset=50` +
      `&limit=25`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('handles multiple calls correctly', async () => {
    const api = setup();

    const mockResponse1: PaginatedResponse<Invoice> = {
      $meta: { pagination: { offset: 0, limit: 2, total: 4 } },
      data: [
        { id: 'INV-1234-7564-9753-3487', documentNo: 'INV-1234-7564-9753-3487' } as Invoice,
        { id: 'INV-1234-7564-9753-3486', documentNo: 'INV-1234-7564-9753-3486' } as Invoice,
      ],
    };

    const mockResponse2: PaginatedResponse<Invoice> = {
      $meta: { pagination: { offset: 2, limit: 2, total: 4 } },
      data: [
        { id: 'INV-1234-7564-9753-3485', documentNo: 'INV-1234-7564-9753-3485' } as Invoice,
        { id: 'INV-1234-7564-9753-3484', documentNo: 'INV-1234-7564-9753-3484' } as Invoice,
      ],
    };

    mockGet.mockResolvedValueOnce(mockResponse1);
    mockGet.mockResolvedValueOnce(mockResponse2);

    let res1: PaginatedResponse<Invoice> | undefined;
    let res2: PaginatedResponse<Invoice> | undefined;

    await act(async () => {
      res1 = await api.getInvoices(0, 2);
    });

    await act(async () => {
      res2 = await api.getInvoices(2, 2);
    });

    expect(res1).toBeDefined();
    expect(res1!.data.length).toBe(2);
    expect(res1!.data.map((item) => item.documentNo)).toEqual([
      'INV-1234-7564-9753-3487',
      'INV-1234-7564-9753-3486',
    ]);

    expect(res2).toBeDefined();
    expect(res2!.data.length).toBe(2);
    expect(res2!.data.map((item) => item.documentNo)).toEqual([
      'INV-1234-7564-9753-3485',
      'INV-1234-7564-9753-3484',
    ]);
  });

  it('returns invoices with correct structure', async () => {
    const api = setup();
    const mockResponse: PaginatedResponse<Invoice> = {
      $meta: {
        pagination: {
          offset: 0,
          limit: 10,
          total: 1,
        },
      },
      data: [
        {
          id: 'INV-1234-7564-9753-3487',
          documentNo: 'INV-1234-7564-9753-3487',
          status: 'Issued',
          audit: {
            created: { at: '2026-01-15T10:00:00.000Z' },
            updated: { at: '2026-01-15T10:00:00.000Z' },
          },
        },
      ],
    };

    mockGet.mockResolvedValueOnce(mockResponse);

    let res;
    await act(async () => {
      res = await api.getInvoices();
    });

    expect(res).toEqual(mockResponse);
    expect(res!.data[0]).toMatchObject({
      id: 'INV-1234-7564-9753-3487',
      documentNo: 'INV-1234-7564-9753-3487',
      status: 'Issued',
    });
  });

  it('handles API errors correctly', async () => {
    const api = setup();
    const mockError = new Error('Network error');

    mockGet.mockRejectedValueOnce(mockError);

    await expect(api.getInvoices()).rejects.toThrow('Network error');
  });
});
