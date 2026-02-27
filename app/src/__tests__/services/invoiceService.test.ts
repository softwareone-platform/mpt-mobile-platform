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

const expectedUrlBase =
  `/v1/billing/invoices` +
  `?select=-*,id,status` +
  `&filter(group.buyers)` +
  `&order=-audit.created.at`;

describe('useBillingApi - Invoices', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getInvoices with default offset and limit', async () => {
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
      res = await api.getInvoices();
    });

    const expectedUrl =
      expectedUrlBase + `&offset=${DEFAULT_OFFSET}` + `&limit=${DEFAULT_PAGE_SIZE}`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('calls getInvoices with custom offset and limit', async () => {
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
      res = await api.getInvoices(50, 25);
    });

    const expectedUrl = expectedUrlBase + `&offset=50` + `&limit=25`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('handles multiple calls correctly', async () => {
    const api = setup();

    const mockResponse1: PaginatedResponse<ListItemNoImageNoSubtitle> = {
      $meta: { pagination: { offset: 0, limit: 2, total: 4 } },
      data: [
        { id: 'INV-1234-7564-9753-3487', status: 'Issued' },
        { id: 'INV-1234-7564-9753-3486', status: 'Issued' },
      ],
    };

    const mockResponse2: PaginatedResponse<ListItemNoImageNoSubtitle> = {
      $meta: { pagination: { offset: 2, limit: 2, total: 4 } },
      data: [
        { id: 'INV-1234-7564-9753-3485', status: 'Paid' },
        { id: 'INV-1234-7564-9753-3484', status: 'Overdue' },
      ],
    };

    mockGet.mockResolvedValueOnce(mockResponse1);
    mockGet.mockResolvedValueOnce(mockResponse2);

    let res1: PaginatedResponse<ListItemNoImageNoSubtitle> | undefined;
    let res2: PaginatedResponse<ListItemNoImageNoSubtitle> | undefined;

    await act(async () => {
      res1 = await api.getInvoices(0, 2);
    });

    await act(async () => {
      res2 = await api.getInvoices(2, 2);
    });

    expect(res1).toBeDefined();
    expect(res1!.data.length).toBe(2);
    expect(res1!.data.map((item) => item.id)).toEqual([
      'INV-1234-7564-9753-3487',
      'INV-1234-7564-9753-3486',
    ]);

    expect(res2).toBeDefined();
    expect(res2!.data.length).toBe(2);
    expect(res2!.data.map((item) => item.status)).toEqual(['Paid', 'Overdue']);
  });

  it('returns invoices with correct structure', async () => {
    const api = setup();
    const mockResponse: PaginatedResponse<ListItemNoImageNoSubtitle> = {
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
          status: 'Issued',
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

describe('useInvoiceApi - getInvoices with optional query', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call getInvoices with a valid custom query', async () => {
    const api = setup();
    const customQuery = `&eq(status,'Overdue')&order=attributes.dueDate`;
    const mockResponse: PaginatedResponse<ListItemNoImageNoSubtitle> = {
      $meta: { pagination: { offset: 0, limit: DEFAULT_PAGE_SIZE, total: 0 } },
      data: [],
    };

    mockGet.mockResolvedValueOnce(mockResponse);

    let res;
    await act(async () => {
      res = await api.getInvoices(undefined, undefined, customQuery);
    });

    const expectedUrl =
      `/v1/billing/invoices` +
      `?select=-*,id,status` +
      `${customQuery}` +
      `&offset=${DEFAULT_OFFSET}` +
      `&limit=${DEFAULT_PAGE_SIZE}`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('should call getBuyers without query and fallback to default currentQuery', async () => {
    const api = setup();
    const mockResponse: PaginatedResponse<ListItemNoImageNoSubtitle> = {
      $meta: { pagination: { offset: 0, limit: DEFAULT_PAGE_SIZE, total: 0 } },
      data: [],
    };

    mockGet.mockResolvedValueOnce(mockResponse);

    let res;
    await act(async () => {
      res = await api.getInvoices();
    });

    const currentQuery = '&filter(group.buyers)&order=-audit.created.at';
    const expectedUrl =
      `/v1/billing/invoices` +
      `?select=-*,id,status` +
      `${currentQuery}` +
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

    await expect(api.getInvoices(undefined, undefined, invalidQuery)).rejects.toThrow(
      'Invalid query',
    );

    const expectedUrl =
      `/v1/billing/invoices` +
      `?select=-*,id,status` +
      `${invalidQuery}` +
      `&offset=${DEFAULT_OFFSET}` +
      `&limit=${DEFAULT_PAGE_SIZE}`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
  });
});
