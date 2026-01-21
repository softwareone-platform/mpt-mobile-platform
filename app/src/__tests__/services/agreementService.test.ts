import { renderHook, act } from '@testing-library/react-native';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useAgreementApi } from '@/services/agreementService';
import type { Agreement } from '@/types/agreement';
import type { PaginatedResponse } from '@/types/api';

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
    const mockResponse: PaginatedResponse<Agreement> = {
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
      `?select=audit` +
      `&filter(group.buyers)` +
      `&and(ne(status,"Draft"),ne(status,"Failed"))` +
      `&order=externalIds.client` +
      `&offset=${DEFAULT_OFFSET}` +
      `&limit=${DEFAULT_PAGE_SIZE}`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('calls getAgreements with custom offset and limit', async () => {
    const api = setup();
    const mockResponse: PaginatedResponse<Agreement> = {
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
      `?select=audit` +
      `&filter(group.buyers)` +
      `&and(ne(status,"Draft"),ne(status,"Failed"))` +
      `&order=externalIds.client` +
      `&offset=50` +
      `&limit=25`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('handles multiple calls correctly', async () => {
    const api = setup();

    const mockResponse1: PaginatedResponse<Agreement> = {
      $meta: { pagination: { offset: 0, limit: 2, total: 4 } },
      data: [
        {
          id: 'AGR-0001',
          name: '365 Analytics for Advance Systems Corp',
          status: 'Active',
          audit: {
            created: { at: '2026-01-15T10:00:00.000Z' },
          },
        } as Agreement,
        {
          id: 'AGR-0002',
          name: 'Power Automate – VertexPoint Systems',
          status: 'Updating',
          audit: {
            created: { at: '2026-01-14T10:00:00.000Z' },
          },
        } as Agreement,
      ],
    };

    const mockResponse2: PaginatedResponse<Agreement> = {
      $meta: { pagination: { offset: 2, limit: 2, total: 4 } },
      data: [
        {
          id: 'AGR-0003',
          name: 'Microsoft Teams – PulseWave Media',
          status: 'Active',
          audit: {
            created: { at: '2026-01-13T10:00:00.000Z' },
          },
        } as Agreement,
        {
          id: 'AGR-0004',
          name: 'Adobe Analytics – RadiantPath Creative Ventures',
          status: 'Terminated',
          audit: {
            created: { at: '2026-01-12T10:00:00.000Z' },
          },
        } as Agreement,
      ],
    };

    mockGet.mockResolvedValueOnce(mockResponse1);
    mockGet.mockResolvedValueOnce(mockResponse2);

    let res1: PaginatedResponse<Agreement> | undefined;
    let res2: PaginatedResponse<Agreement> | undefined;

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
    const mockAgreement: Agreement = {
      id: 'AGR-1234',
      name: 'Premium Agreement',
      status: 'Active',
      externalIds: {
        client: 'EXT-001',
      },
      product: { name: 'Product A' },
      seller: {
        address: { country: 'US' },
      },
      listing: { id: 'LST-001' },
      licensee: {
        eligibility: { type: 'enterprise' },
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

    const mockResponse: PaginatedResponse<Agreement> = {
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
