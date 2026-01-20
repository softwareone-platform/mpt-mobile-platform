import { renderHook, act } from '@testing-library/react-native';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useSubscriptionApi } from '@/services/subscriptionService';
import type { PaginatedResponse } from '@/types/api';
import type { Subscription } from '@/types/subscription';

const mockGet = jest.fn();

jest.mock('@/hooks/useApi', () => ({
  useApi: () => ({
    get: mockGet,
  }),
}));

const setup = () => renderHook(() => useSubscriptionApi()).result.current;

describe('useSubscriptionApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getSubscriptions with default offset and limit', async () => {
    const api = setup();
    const mockResponse: PaginatedResponse<Subscription> = {
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
      res = await api.getSubscriptions();
    });

    const expectedUrl =
      `/v1/commerce/subscriptions` +
      `?select=agreement,agreement.listing.priceList,audit.created,audit.updated,seller.address` +
      `&filter(group.buyers)` +
      `&offset=${DEFAULT_OFFSET}` +
      `&limit=${DEFAULT_PAGE_SIZE}`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('calls getSubscriptions with custom offset and limit', async () => {
    const api = setup();
    const mockResponse: PaginatedResponse<Subscription> = {
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
      res = await api.getSubscriptions(50, 25);
    });

    const expectedUrl =
      `/v1/commerce/subscriptions` +
      `?select=agreement,agreement.listing.priceList,audit.created,audit.updated,seller.address` +
      `&filter(group.buyers)` +
      `&offset=50` +
      `&limit=25`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('handles multiple calls correctly', async () => {
    const api = setup();

    const mockResponse1: PaginatedResponse<Subscription> = {
      $meta: { pagination: { offset: 0, limit: 2, total: 4 } },
      data: [
        {
          id: 'SUB-0001',
          name: 'Premium Plan',
          status: 'Active',
          audit: {
            created: { at: '2026-01-15T10:00:00.000Z' },
          },
        } as Subscription,
        {
          id: 'SUB-0002',
          name: 'Basic Plan',
          status: 'Active',
          audit: {
            created: { at: '2026-01-14T10:00:00.000Z' },
          },
        } as Subscription,
      ],
    };

    const mockResponse2: PaginatedResponse<Subscription> = {
      $meta: { pagination: { offset: 2, limit: 2, total: 4 } },
      data: [
        {
          id: 'SUB-0003',
          name: 'Enterprise Plan',
          status: 'Terminated',
          audit: {
            created: { at: '2026-01-13T10:00:00.000Z' },
          },
        } as Subscription,
        {
          id: 'SUB-0004',
          name: 'Starter Plan',
          status: 'Suspended',
          audit: {
            created: { at: '2026-01-12T10:00:00.000Z' },
          },
        } as Subscription,
      ],
    };

    mockGet.mockResolvedValueOnce(mockResponse1);
    mockGet.mockResolvedValueOnce(mockResponse2);

    let res1: PaginatedResponse<Subscription> | undefined;
    let res2: PaginatedResponse<Subscription> | undefined;

    await act(async () => {
      res1 = await api.getSubscriptions(0, 2);
    });

    await act(async () => {
      res2 = await api.getSubscriptions(2, 2);
    });

    expect(res1).toBeDefined();
    expect(res1!.data.length).toBe(2);
    expect(res1!.data.map((item) => item.id)).toEqual(['SUB-0001', 'SUB-0002']);
    expect(res1!.data.map((item) => item.name)).toEqual(['Premium Plan', 'Basic Plan']);

    expect(res2).toBeDefined();
    expect(res2!.data.length).toBe(2);
    expect(res2!.data.map((item) => item.id)).toEqual(['SUB-0003', 'SUB-0004']);
    expect(res2!.data.map((item) => item.status)).toEqual(['Terminated', 'Suspended']);
  });

  it('returns correct subscription data structure', async () => {
    const api = setup();
    const mockSubscription: Subscription = {
      id: 'SUB-1234',
      name: 'Premium Subscription',
      status: 'Active',
      agreement: {
        id: 'AGR-001',
        listing: {
          priceList: { currency: 'USD' },
        },
      },
      seller: {
        address: { country: 'US' },
      },
      audit: {
        created: {
          at: '2026-01-01T10:00:00.000Z',
        },
        updated: {
          at: '2026-01-15T14:30:00.000Z',
        },
      },
    };

    const mockResponse: PaginatedResponse<Subscription> = {
      $meta: {
        pagination: {
          offset: 0,
          limit: 10,
          total: 1,
        },
      },
      data: [mockSubscription],
    };

    mockGet.mockResolvedValueOnce(mockResponse);

    let res;
    await act(async () => {
      res = await api.getSubscriptions();
    });

    expect(res).toEqual(mockResponse);
    expect(res!.data[0]).toMatchObject({
      id: 'SUB-1234',
      name: 'Premium Subscription',
      status: 'Active',
    });
  });

  it('handles API errors correctly', async () => {
    const api = setup();
    const mockError = new Error('Network error');

    mockGet.mockRejectedValueOnce(mockError);

    await expect(api.getSubscriptions()).rejects.toThrow('Network error');
  });
});
