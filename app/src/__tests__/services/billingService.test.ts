import { renderHook, act } from '@testing-library/react-native';

import { mockNetworkError } from '../__mocks__/services/common';
import {
  mockInvoiceId1,
  mockInvoiceId2,
  mockInvoiceData,
  expectedUrl1,
  expectedUrl2,
  mockResponse1,
  mockResponse2,
} from '../__mocks__/services/invoice';
import {
  mockStatementId1,
  mockStatementId2,
  mockStatementData,
  expectedStatementUrl1,
  expectedStatementUrl2,
  mockStatementResponse1,
  mockStatementResponse2,
} from '../__mocks__/services/statement';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useBillingApi } from '@/services/billingService';
import type { PaginatedResponse, ListItemNoImageNoSubtitle } from '@/types/api';
import type { CreditMemoDetails } from '@/types/billing';

const mockGet = jest.fn();

jest.mock('@/hooks/useApi', () => ({
  useApi: () => ({
    get: mockGet,
  }),
}));

const setup = () => renderHook(() => useBillingApi()).result.current;

const expectedUrlBase =
  `/v1/billing/credit-memos` +
  `?select=-*,id,status` +
  `&filter(group.buyers)` +
  `&order=-audit.created.at`;

describe('useBillingApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getCreditMemos with default offset and limit', async () => {
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
      res = await api.getCreditMemos();
    });

    const expectedUrl =
      expectedUrlBase + `&offset=${DEFAULT_OFFSET}` + `&limit=${DEFAULT_PAGE_SIZE}`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('calls getCreditMemos with custom offset and limit', async () => {
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
      res = await api.getCreditMemos(50, 25);
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
        { id: 'CRD-111-222-333', status: 'Issued' },
        { id: 'CRD-111-222-334', status: 'Issued' },
      ],
    };

    const mockResponse2: PaginatedResponse<ListItemNoImageNoSubtitle> = {
      $meta: { pagination: { offset: 2, limit: 2, total: 4 } },
      data: [
        { id: 'CRD-111-222-335', status: 'Issued' },
        { id: 'CRD-111-222-336', status: 'Issued' },
      ],
    };

    mockGet.mockResolvedValueOnce(mockResponse1);
    mockGet.mockResolvedValueOnce(mockResponse2);

    let res1: PaginatedResponse<ListItemNoImageNoSubtitle> | undefined;
    let res2: PaginatedResponse<ListItemNoImageNoSubtitle> | undefined;

    await act(async () => {
      res1 = await api.getCreditMemos(0, 2);
    });

    await act(async () => {
      res2 = await api.getCreditMemos(2, 2);
    });

    expect(res1).toBeDefined();
    expect(res1!.data.length).toBe(2);
    expect(res1!.data.map((item) => item.id)).toEqual(['CRD-111-222-333', 'CRD-111-222-334']);

    expect(res2).toBeDefined();
    expect(res2!.data.length).toBe(2);
    expect(res2!.data.map((item) => item.id)).toEqual(['CRD-111-222-335', 'CRD-111-222-336']);
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
      price: {
        currency: 'USD',
      },
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

describe('useBillingApi - getInvoiceData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getInvoiceData with correct endpoint and returns data', async () => {
    const api = setup();

    let res;

    mockGet.mockResolvedValueOnce(mockInvoiceData);

    await act(async () => {
      res = await api.getInvoiceData(mockInvoiceId1);
    });

    expect(mockGet).toHaveBeenCalledWith(expectedUrl1);
    expect(res).toEqual(mockInvoiceData);
  });

  it('handles API errors correctly', async () => {
    const api = setup();

    mockGet.mockRejectedValueOnce(mockNetworkError);

    await expect(api.getInvoiceData(mockInvoiceId1)).rejects.toThrow('Network error');
  });

  it('handles multiple calls correctly', async () => {
    const api = setup();

    let res1;
    let res2;

    mockGet.mockResolvedValueOnce(mockResponse1);
    mockGet.mockResolvedValueOnce(mockResponse2);

    await act(async () => {
      res1 = await api.getInvoiceData(mockInvoiceId1);
    });

    await act(async () => {
      res2 = await api.getInvoiceData(mockInvoiceId2);
    });

    expect(mockGet).toHaveBeenNthCalledWith(1, expectedUrl1);
    expect(mockGet).toHaveBeenNthCalledWith(2, expectedUrl2);

    expect(res1).toEqual(mockResponse1);
    expect(res2).toEqual(mockResponse2);
  });
});

describe('useBillingApi - getStatementData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getStatementData with correct endpoint and returns data', async () => {
    const api = setup();

    let res;

    mockGet.mockResolvedValueOnce(mockStatementData);

    await act(async () => {
      res = await api.getStatementData(mockStatementId1);
    });

    expect(mockGet).toHaveBeenCalledWith(expectedStatementUrl1);
    expect(res).toEqual(mockStatementData);
  });

  it('handles API errors correctly', async () => {
    const api = setup();

    mockGet.mockRejectedValueOnce(mockNetworkError);

    await expect(api.getStatementData(mockStatementId1)).rejects.toThrow('Network error');
  });

  it('handles multiple calls correctly', async () => {
    const api = setup();

    let res1;
    let res2;

    mockGet.mockResolvedValueOnce(mockStatementResponse1);
    mockGet.mockResolvedValueOnce(mockStatementResponse2);

    await act(async () => {
      res1 = await api.getStatementData(mockStatementId1);
    });

    await act(async () => {
      res2 = await api.getStatementData(mockStatementId2);
    });

    expect(mockGet).toHaveBeenNthCalledWith(1, expectedStatementUrl1);
    expect(mockGet).toHaveBeenNthCalledWith(2, expectedStatementUrl2);

    expect(res1).toEqual(mockStatementResponse1);
    expect(res2).toEqual(mockStatementResponse2);
  });
});
