import { renderHook, act } from '@testing-library/react-native';

import {
  mockAgreementId1,
  mockAgreementId2,
  mockAgreementData,
  expectedUrl1,
  expectedUrl2,
  mockResponse1,
  mockResponse2,
} from '../__mocks__/services/agreement';
import { mockNetworkError } from '../__mocks__/services/common';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useAgreementApi } from '@/services/agreementService';
import type { PaginatedResponse, ListItemNoImage } from '@/types/api';

const mockGet = jest.fn();

jest.mock('@/hooks/useApi', () => ({
  useApi: () => ({
    get: mockGet,
  }),
}));

const setup = () => renderHook(() => useAgreementApi()).result.current;

describe('useAgreementApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getAgreements with default offset and limit', async () => {
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
      res = await api.getAgreements();
    });

    const expectedUrl =
      `/v1/commerce/agreements` +
      `?select=-*,id,name,status` +
      `&filter(group.buyers)` +
      `&and(ne(status,"Draft"),ne(status,"Failed"))` +
      `&order=name` +
      `&offset=${DEFAULT_OFFSET}` +
      `&limit=${DEFAULT_PAGE_SIZE}`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('calls getAgreements with custom offset and limit', async () => {
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
      res = await api.getAgreements(50, 25);
    });

    const expectedUrl =
      `/v1/commerce/agreements` +
      `?select=-*,id,name,status` +
      `&filter(group.buyers)` +
      `&and(ne(status,"Draft"),ne(status,"Failed"))` +
      `&order=name` +
      `&offset=50` +
      `&limit=25`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('handles multiple calls correctly', async () => {
    const api = setup();

    const mockResponse1: PaginatedResponse<ListItemNoImage> = {
      $meta: { pagination: { offset: 0, limit: 2, total: 4 } },
      data: [
        {
          id: 'AGR-0001',
          name: '365 Analytics for Advance Systems Corp',
          status: 'Active',
        },
        {
          id: 'AGR-0002',
          name: 'Power Automate – VertexPoint Systems',
          status: 'Updating',
        },
      ],
    };

    const mockResponse2: PaginatedResponse<ListItemNoImage> = {
      $meta: { pagination: { offset: 2, limit: 2, total: 4 } },
      data: [
        {
          id: 'AGR-0003',
          name: 'Microsoft Teams – PulseWave Media',
          status: 'Active',
        },
        {
          id: 'AGR-0004',
          name: 'Adobe Analytics – RadiantPath Creative Ventures',
          status: 'Terminated',
        },
      ],
    };

    mockGet.mockResolvedValueOnce(mockResponse1);
    mockGet.mockResolvedValueOnce(mockResponse2);

    let res1: PaginatedResponse<ListItemNoImage> | undefined;
    let res2: PaginatedResponse<ListItemNoImage> | undefined;

    await act(async () => {
      res1 = await api.getAgreements(0, 2);
    });

    await act(async () => {
      res2 = await api.getAgreements(2, 2);
    });

    expect(res1).toBeDefined();
    expect(res1!.data.length).toBe(2);
    expect(res1!.data.map((item) => item.id)).toEqual(['AGR-0001', 'AGR-0002']);
    expect(res1!.data.map((item) => item.name)).toEqual([
      '365 Analytics for Advance Systems Corp',
      'Power Automate – VertexPoint Systems',
    ]);

    expect(res2).toBeDefined();
    expect(res2!.data.length).toBe(2);
    expect(res2!.data.map((item) => item.id)).toEqual(['AGR-0003', 'AGR-0004']);
    expect(res2!.data.map((item) => item.status)).toEqual(['Active', 'Terminated']);
  });

  it('returns correct agreement data structure', async () => {
    const api = setup();
    const mockAgreement: ListItemNoImage = {
      id: 'AGR-1234',
      name: 'Premium Agreement',
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
      data: [mockAgreement],
    };

    mockGet.mockResolvedValueOnce(mockResponse);

    let res;
    await act(async () => {
      res = await api.getAgreements();
    });

    expect(res).toEqual(mockResponse);
    expect(res!.data[0]).toMatchObject({
      id: 'AGR-1234',
      name: 'Premium Agreement',
      status: 'Active',
    });
  });

  it('handles API errors correctly', async () => {
    const api = setup();
    const mockError = new Error('Network error');

    mockGet.mockRejectedValueOnce(mockError);

    await expect(api.getAgreements()).rejects.toThrow('Network error');
  });
});

describe('useAgreementApi - getAgreementData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getAgreementData with correct endpoint and returns data', async () => {
    const api = setup();

    let res;

    mockGet.mockResolvedValueOnce(mockAgreementData);

    await act(async () => {
      res = await api.getAgreementData(mockAgreementId1);
    });

    expect(mockGet).toHaveBeenCalledWith(expectedUrl1);
    expect(res).toEqual(mockAgreementData);
  });

  it('handles API errors correctly', async () => {
    const api = setup();

    mockGet.mockRejectedValueOnce(mockNetworkError);

    await expect(api.getAgreementData(mockAgreementId1)).rejects.toThrow('Network error');
  });

  it('handles multiple calls correctly', async () => {
    const api = setup();

    let res1;
    let res2;

    mockGet.mockResolvedValueOnce(mockResponse1);
    mockGet.mockResolvedValueOnce(mockResponse2);

    await act(async () => {
      res1 = await api.getAgreementData(mockAgreementId1);
    });

    await act(async () => {
      res2 = await api.getAgreementData(mockAgreementId2);
    });

    expect(mockGet).toHaveBeenNthCalledWith(1, expectedUrl1);
    expect(mockGet).toHaveBeenNthCalledWith(2, expectedUrl2);

    expect(res1).toEqual(mockResponse1);
    expect(res2).toEqual(mockResponse2);
  });
});
