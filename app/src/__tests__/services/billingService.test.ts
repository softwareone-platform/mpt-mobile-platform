import { renderHook, act } from '@testing-library/react-native';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useBillingApi } from '@/services/billingService';
import type { PaginatedResponse } from '@/types/api';
import type { CreditMemo, CreditMemoDetails } from '@/types/billing';

const mockGet = jest.fn();

jest.mock('@/hooks/useApi', () => ({
  useApi: () => ({
    get: mockGet,
  }),
}));

const setup = () => renderHook(() => useBillingApi()).result.current;

describe('useBillingApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getCreditMemos with default offset and limit', async () => {
    const api = setup();
    const mockResponse: PaginatedResponse<CreditMemo> = {
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
      res = await api.getCreditMemos();
    });

    const expectedUrl =
      `/v1/billing/credit-memos` +
      `?select=-*,id,documentNo,attributes.postingDate,attributes.documentDate,attributes.externalDocumentNo,status,price.totalSP` +
      `&filter(group.buyers)` +
      `&order=-audit.created.at` +
      `&offset=${DEFAULT_OFFSET}` +
      `&limit=${DEFAULT_PAGE_SIZE}`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('calls getCreditMemos with custom offset and limit', async () => {
    const api = setup();
    const mockResponse: PaginatedResponse<CreditMemo> = {
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
      res = await api.getCreditMemos(50, 25);
    });

    const expectedUrl =
      `/v1/billing/credit-memos` +
      `?select=-*,id,documentNo,attributes.postingDate,attributes.documentDate,attributes.externalDocumentNo,status,price.totalSP` +
      `&filter(group.buyers)` +
      `&order=-audit.created.at` +
      `&offset=50` +
      `&limit=25`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('handles multiple calls correctly', async () => {
    const api = setup();

    const mockResponse1: PaginatedResponse<CreditMemo> = {
      $meta: { pagination: { offset: 0, limit: 2, total: 4 } },
      data: [
        { id: 'CM1', documentNo: 'DOC1' } as CreditMemo,
        { id: 'CM2', documentNo: 'DOC2' } as CreditMemo,
      ],
    };

    const mockResponse2: PaginatedResponse<CreditMemo> = {
      $meta: { pagination: { offset: 2, limit: 2, total: 4 } },
      data: [
        { id: 'CM3', documentNo: 'DOC3' } as CreditMemo,
        { id: 'CM4', documentNo: 'DOC4' } as CreditMemo,
      ],
    };

    mockGet.mockResolvedValueOnce(mockResponse1);
    mockGet.mockResolvedValueOnce(mockResponse2);

    let res1: PaginatedResponse<CreditMemo> | undefined;
    let res2: PaginatedResponse<CreditMemo> | undefined;

    await act(async () => {
      res1 = await api.getCreditMemos(0, 2);
    });

    await act(async () => {
      res2 = await api.getCreditMemos(2, 2);
    });

    expect(res1).toBeDefined();
    expect(res1!.data.length).toBe(2);
    expect(res1!.data.map((item) => item.id)).toEqual(['CM1', 'CM2']);

    expect(res2).toBeDefined();
    expect(res2!.data.length).toBe(2);
    expect(res2!.data.map((item) => item.id)).toEqual(['CM3', 'CM4']);
  });
});

describe('useBillingApi – getCreditMemoDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls api.get with correct endpoint and returns mapped data', async () => {
    const creditMemoId = 'CRD-4164-9427-6482-9469';

    const mockResponse: CreditMemoDetails = {
      id: creditMemoId,
      documentNo: 'CH-CM-160386',
      status: 'Issued',
      postingDate: '2026-01-20T00:00:00.000Z',
      documentDate: '2026-01-20T00:00:00.000Z',
      buyerName: 'Siemens Canada Limited',
      sellerName: 'SoftwareONE Switzerland',
      sellerCountry: 'CH',
      totalAmount: 32.43,
      currency: 'USD',
      audit: {},
    };

    mockGet.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useBillingApi());

    let data: CreditMemoDetails | undefined;

    await act(async () => {
      data = await result.current.getCreditMemoDetails(creditMemoId);
    });

    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith(
      `/v1/billing/credit-memos/${creditMemoId}?select=seller.address.country,audit,statement,statement.ledger.owner`,
    );

    expect(data).toEqual(mockResponse);
  });

  it('throws if api.get rejects', async () => {
    const creditMemoId = 'CRD-1';
    const error = new Error('Network error');

    mockGet.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useBillingApi());

    await expect(result.current.getCreditMemoDetails(creditMemoId)).rejects.toThrow(
      'Network error',
    );
  });
});
