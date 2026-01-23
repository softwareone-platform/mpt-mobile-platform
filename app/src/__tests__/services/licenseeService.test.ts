import { renderHook, act } from '@testing-library/react-native';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useUserApi } from '@/services/userService';
import type { PaginatedResponse, Licensee } from '@/types/api';

const mockGet = jest.fn();

jest.mock('@/hooks/useApi', () => ({
  useApi: () => ({
    get: mockGet,
  }),
}));

const setup = () => renderHook(() => useUserApi()).result.current;

describe('useUserApi - getLicensees', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getLicensees with default offset and limit', async () => {
    const api = setup();
    const mockResponse: PaginatedResponse<Licensee> = {
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
      res = await api.getLicensees('ACC-0000-0001');
    });

    const expectedUrl =
      `/v1/accounts/licensees` +
      `?select=seller,buyer.status` +
      `&eq(account.id,%22ACC-0000-0001%22)` +
      `&order=name` +
      `&offset=${DEFAULT_OFFSET}` +
      `&limit=${DEFAULT_PAGE_SIZE}`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('calls getLicensees with custom offset and limit', async () => {
    const api = setup();
    const mockResponse: PaginatedResponse<Licensee> = {
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
      res = await api.getLicensees('ACC-1234-5678', 50, 25);
    });

    const expectedUrl =
      `/v1/accounts/licensees` +
      `?select=seller,buyer.status` +
      `&eq(account.id,%22ACC-1234-5678%22)` +
      `&order=name` +
      `&offset=50` +
      `&limit=25`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('handles multiple calls correctly', async () => {
    const api = setup();

    const mockResponse1: PaginatedResponse<Licensee> = {
      $meta: { pagination: { offset: 0, limit: 2, total: 4 } },
      data: [
        {
          id: 'LCE-2001-8001-0001',
          name: 'Premium Licensee Corp',
          status: 'Active',
          icon: '/path/to/premium-icon.png',
        } as Licensee,
        {
          id: 'LCE-2002-8002-0002',
          name: 'Standard Licensee Ltd',
          status: 'Active',
          icon: '/path/to/standard-icon.png',
        } as Licensee,
      ],
    };

    const mockResponse2: PaginatedResponse<Licensee> = {
      $meta: { pagination: { offset: 2, limit: 2, total: 4 } },
      data: [
        {
          id: 'LCE-2003-8003-0003',
          name: 'Enterprise Licensee Inc',
          status: 'Enabled',
          icon: '/path/to/enterprise-icon.png',
        } as Licensee,
        {
          id: 'LCE-2004-8004-0004',
          name: 'Starter Licensee Co',
          status: 'Active',
          icon: '/path/to/starter-icon.png',
        } as Licensee,
      ],
    };

    mockGet.mockResolvedValueOnce(mockResponse1);
    mockGet.mockResolvedValueOnce(mockResponse2);

    let res1: PaginatedResponse<Licensee> | undefined;
    let res2: PaginatedResponse<Licensee> | undefined;

    await act(async () => {
      res1 = await api.getLicensees('ACC-0000-0001', 0, 2);
    });

    await act(async () => {
      res2 = await api.getLicensees('ACC-0000-0001', 2, 2);
    });

    expect(res1).toBeDefined();
    expect(res1!.data.length).toBe(2);

    expect(res1!.data.map((item) => item.id)).toEqual(['LCE-2001-8001-0001', 'LCE-2002-8002-0002']);
    expect(res1!.data.map((item) => item.name)).toEqual([
      'Premium Licensee Corp',
      'Standard Licensee Ltd',
    ]);

    expect(res2).toBeDefined();
    expect(res2!.data.length).toBe(2);
    expect(res2!.data.map((item) => item.id)).toEqual(['LCE-2003-8003-0003', 'LCE-2004-8004-0004']);
    expect(res2!.data.map((item) => item.name)).toEqual([
      'Enterprise Licensee Inc',
      'Starter Licensee Co',
    ]);
  });

  it('returns correct licensee data structure', async () => {
    const api = setup();
    const mockLicensee: Licensee = {
      id: 'LCE-7890-1234-0001',
      name: 'Global Licensee Solutions',
      status: 'Active',
      icon: '/path/to/global-licensee-icon.png',
    };

    const mockResponse: PaginatedResponse<Licensee> = {
      $meta: {
        pagination: {
          offset: 0,
          limit: 10,
          total: 1,
        },
      },
      data: [mockLicensee],
    };

    mockGet.mockResolvedValueOnce(mockResponse);

    let res;
    await act(async () => {
      res = await api.getLicensees('ACC-0000-0001');
    });

    expect(res).toEqual(mockResponse);
    expect(res!.data[0]).toMatchObject({
      id: 'LCE-7890-1234-0001',
      name: 'Global Licensee Solutions',
      status: 'Active',
    });
  });

  it('handles API errors correctly', async () => {
    const api = setup();
    const mockError = new Error('Network error');

    mockGet.mockRejectedValueOnce(mockError);

    await expect(api.getLicensees('ACC-0000-0001')).rejects.toThrow('Network error');
  });
});
