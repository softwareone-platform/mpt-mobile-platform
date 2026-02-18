import { renderHook, act } from '@testing-library/react-native';

import { mockNetworkError } from '../__mocks__/services/common';
import {
  mockSubscriptionId1,
  mockSubscriptionId2,
  mockSubscriptionData,
  expectedUrl1,
  expectedUrl2,
  mockResponse1,
  mockResponse2,
} from '../__mocks__/services/subscription';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useSubscriptionApi } from '@/services/subscriptionService';
import type { PaginatedResponse, ListItemNoImage } from '@/types/api';

const mockGet = jest.fn();

jest.mock('@/hooks/useApi', () => ({
  useApi: () => ({
    get: mockGet,
  }),
}));

const setup = () => renderHook(() => useSubscriptionApi()).result.current;

const expectedUrlBase =
  `/v1/commerce/subscriptions` + `?select=-*,id,name,status` + `&filter(group.buyers)`;

describe('useSubscriptionApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getSubscriptions with default offset and limit', async () => {
    const api = setup();
    const mockResponse: PaginatedResponse<ListItemNoImage> = {
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
      expectedUrlBase + `&offset=${DEFAULT_OFFSET}` + `&limit=${DEFAULT_PAGE_SIZE}`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('calls getSubscriptions with custom offset and limit', async () => {
    const api = setup();
    const mockResponse: PaginatedResponse<ListItemNoImage> = {
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

    const expectedUrl = expectedUrlBase + `&offset=50` + `&limit=25`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('handles multiple calls correctly', async () => {
    const api = setup();

    const mockResponse1: PaginatedResponse<ListItemNoImage> = {
      $meta: { pagination: { offset: 0, limit: 2, total: 4 } },
      data: [
        {
          id: 'SUB-0001',
          name: 'Premium Plan',
          status: 'Active',
        },
        {
          id: 'SUB-0002',
          name: 'Basic Plan',
          status: 'Active',
        },
      ],
    };

    const mockResponse2: PaginatedResponse<ListItemNoImage> = {
      $meta: { pagination: { offset: 2, limit: 2, total: 4 } },
      data: [
        {
          id: 'SUB-0003',
          name: 'Enterprise Plan',
          status: 'Terminated',
        },
        {
          id: 'SUB-0004',
          name: 'Starter Plan',
          status: 'Suspended',
        },
      ],
    };

    mockGet.mockResolvedValueOnce(mockResponse1);
    mockGet.mockResolvedValueOnce(mockResponse2);

    let res1: PaginatedResponse<ListItemNoImage> | undefined;
    let res2: PaginatedResponse<ListItemNoImage> | undefined;

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
    const mockSubscription: ListItemNoImage = {
      id: 'SUB-1234',
      name: 'Premium Subscription',
      status: 'Active',
    };

    const mockResponse: PaginatedResponse<ListItemNoImage> = {
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

describe('useSubscriptionApi - getSubscriptionData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getSubscriptionData with correct endpoint and returns data', async () => {
    const api = setup();

    let res;

    mockGet.mockResolvedValueOnce(mockSubscriptionData);

    await act(async () => {
      res = await api.getSubscriptionData(mockSubscriptionId1);
    });

    expect(mockGet).toHaveBeenCalledWith(expectedUrl1);
    expect(res).toEqual(mockSubscriptionData);
  });

  it('handles API errors correctly', async () => {
    const api = setup();

    mockGet.mockRejectedValueOnce(mockNetworkError);

    await expect(api.getSubscriptionData(mockSubscriptionId1)).rejects.toThrow('Network error');
  });

  it('handles multiple calls correctly', async () => {
    const api = setup();

    let res1;
    let res2;

    mockGet.mockResolvedValueOnce(mockResponse1);
    mockGet.mockResolvedValueOnce(mockResponse2);

    await act(async () => {
      res1 = await api.getSubscriptionData(mockSubscriptionId1);
    });

    await act(async () => {
      res2 = await api.getSubscriptionData(mockSubscriptionId2);
    });

    expect(mockGet).toHaveBeenNthCalledWith(1, expectedUrl1);
    expect(mockGet).toHaveBeenNthCalledWith(2, expectedUrl2);

    expect(res1).toEqual(mockResponse1);
    expect(res2).toEqual(mockResponse2);
  });
});
