import { renderHook, act } from '@testing-library/react-native';

import {
  mockCertificateId1,
  mockCertificateId2,
  mockCertificateData,
  expectedCertificateUrl1,
  expectedCertificateUrl2,
  mockCertificateResponse1,
  mockCertificateResponse2,
  mockCertificateListItem4,
  mockCertificateListItem1,
  mockCertificateListItem2,
  mockCertificateListItem3,
} from '../__mocks__/services/certificate';
import { mockNetworkError } from '../__mocks__/services/common';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useCertificateApi } from '@/services/certificateService';
import type { PaginatedResponse, ListItemNoImage } from '@/types/api';

const mockGet = jest.fn();

jest.mock('@/hooks/useApi', () => ({
  useApi: () => ({
    get: mockGet,
  }),
}));

const setup = () => renderHook(() => useCertificateApi()).result.current;

describe('useCertificateApi - getCertificateData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getCertificateData with correct endpoint and returns data', async () => {
    const api = setup();

    let res;

    mockGet.mockResolvedValueOnce(mockCertificateData);

    await act(async () => {
      res = await api.getCertificateData(mockCertificateId1);
    });

    expect(mockGet).toHaveBeenCalledWith(expectedCertificateUrl1);
    expect(res).toEqual(mockCertificateData);
  });

  it('handles API errors correctly', async () => {
    const api = setup();

    mockGet.mockRejectedValueOnce(mockNetworkError);

    await expect(api.getCertificateData(mockCertificateId1)).rejects.toThrow('Network error');
  });

  it('handles multiple calls correctly', async () => {
    const api = setup();

    let res1;
    let res2;

    mockGet.mockResolvedValueOnce(mockCertificateResponse1);
    mockGet.mockResolvedValueOnce(mockCertificateResponse2);

    await act(async () => {
      res1 = await api.getCertificateData(mockCertificateId1);
    });

    await act(async () => {
      res2 = await api.getCertificateData(mockCertificateId2);
    });

    expect(mockGet).toHaveBeenNthCalledWith(1, expectedCertificateUrl1);
    expect(mockGet).toHaveBeenNthCalledWith(2, expectedCertificateUrl2);

    expect(res1).toEqual(mockCertificateResponse1);
    expect(res2).toEqual(mockCertificateResponse2);
  });
});

describe('useCertificateApi - getCertificates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const expectedUrlBase =
    `/v1/program/certificates` +
    `?select=-*,id,name,status` +
    `&ne(status,%22Deleted%22)` +
    `&order=name`;

  it('calls getCertificates with default offset and limit', async () => {
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
    const expectedUrl =
      expectedUrlBase + `&offset=${DEFAULT_OFFSET}` + `&limit=${DEFAULT_PAGE_SIZE}`;

    mockGet.mockResolvedValueOnce(mockResponse);

    let res;
    await act(async () => {
      res = await api.getCertificates();
    });

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('calls getCertificates with custom offset and limit', async () => {
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

    const expectedUrl = expectedUrlBase + `&offset=50` + `&limit=25`;

    mockGet.mockResolvedValueOnce(mockResponse);

    let res;
    await act(async () => {
      res = await api.getCertificates(50, 25);
    });

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('handles multiple calls correctly', async () => {
    const api = setup();

    const mockResponse1: PaginatedResponse<ListItemNoImage> = {
      $meta: { pagination: { offset: 0, limit: 2, total: 4 } },
      data: [mockCertificateListItem1, mockCertificateListItem2],
    };

    const mockResponse2: PaginatedResponse<ListItemNoImage> = {
      $meta: { pagination: { offset: 2, limit: 2, total: 4 } },
      data: [mockCertificateListItem3, mockCertificateListItem4],
    };

    mockGet.mockResolvedValueOnce(mockResponse1);
    mockGet.mockResolvedValueOnce(mockResponse2);

    let res1: PaginatedResponse<ListItemNoImage> | undefined;
    let res2: PaginatedResponse<ListItemNoImage> | undefined;

    await act(async () => {
      res1 = await api.getCertificates(0, 2);
    });

    await act(async () => {
      res2 = await api.getCertificates(2, 2);
    });

    expect(res1).toBeDefined();
    expect(res1!.data.length).toBe(2);
    expect(res1!.data.map((item) => item.id)).toEqual([
      mockCertificateListItem1.id,
      mockCertificateListItem2.id,
    ]);
    expect(res1!.data.map((item) => item.name)).toEqual([
      mockCertificateListItem1.name,
      mockCertificateListItem2.name,
    ]);
    expect(res1!.data.map((item) => item.status)).toEqual([
      mockCertificateListItem1.status,
      mockCertificateListItem2.status,
    ]);

    expect(res2).toBeDefined();
    expect(res2!.data.length).toBe(2);
    expect(res2!.data.map((item) => item.id)).toEqual([
      mockCertificateListItem3.id,
      mockCertificateListItem4.id,
    ]);
    expect(res2!.data.map((item) => item.name)).toEqual([
      mockCertificateListItem3.name,
      mockCertificateListItem4.name,
    ]);
    expect(res2!.data.map((item) => item.status)).toEqual([
      mockCertificateListItem3.status,
      mockCertificateListItem4.status,
    ]);
  });

  it('returns correct certificate data structure for list view', async () => {
    const api = setup();

    const mockResponse: PaginatedResponse<ListItemNoImage> = {
      $meta: {
        pagination: {
          offset: 0,
          limit: 10,
          total: 1,
        },
      },
      data: [mockCertificateListItem1 as ListItemNoImage],
    };

    mockGet.mockResolvedValueOnce(mockResponse);

    let res;
    await act(async () => {
      res = await api.getCertificates();
    });

    expect(res).toEqual(mockResponse);
    expect(res!.data[0]).toMatchObject({
      id: mockCertificateListItem1.id,
      name: mockCertificateListItem1.name,
      status: mockCertificateListItem1.status,
    });
  });

  it('handles API errors correctly', async () => {
    const api = setup();

    mockGet.mockRejectedValueOnce(mockNetworkError);

    await expect(api.getCertificates()).rejects.toThrow('Network error');
  });
});
