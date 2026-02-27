import { renderHook, act } from '@testing-library/react-native';

import { mockNetworkError } from '../__mocks__/services/common';
import {
  mockEnrollmentId1,
  mockEnrollmentId2,
  mockEnrollmentData,
  expectedEnrollmentUrl1,
  expectedEnrollmentUrl2,
  mockEnrollmentResponse1,
  mockEnrollmentResponse2,
} from '../__mocks__/services/enrollment';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useEnrollmentApi } from '@/services/enrollmentService';
import type { PaginatedResponse, ListItemNoImageNoSubtitle } from '@/types/api';

const mockGet = jest.fn();

jest.mock('@/hooks/useApi', () => ({
  useApi: () => ({
    get: mockGet,
  }),
}));

const setup = () => renderHook(() => useEnrollmentApi()).result.current;

describe('useEnrollmentApi - getEnrollments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getEnrollments with default offset and limit', async () => {
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
      res = await api.getEnrollments();
    });

    const expectedUrl =
      `/v1/program/enrollments` +
      `?select=-*,id,status` +
      `&order=-id` +
      `&offset=${DEFAULT_OFFSET}` +
      `&limit=${DEFAULT_PAGE_SIZE}`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('calls getEnrollments with custom offset and limit', async () => {
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
      res = await api.getEnrollments(50, 25);
    });

    const expectedUrl =
      `/v1/program/enrollments` +
      `?select=-*,id,status` +
      `&order=-id` +
      `&offset=50` +
      `&limit=25`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('handles multiple calls correctly', async () => {
    const api = setup();

    const mockResponse1: PaginatedResponse<ListItemNoImageNoSubtitle> = {
      $meta: { pagination: { offset: 0, limit: 2, total: 4 } },
      data: [
        {
          id: 'ENR-1234-7564-2273',
          status: 'Completed',
        },
        {
          id: 'ENR-1234-7564-3476',
          status: 'Completed',
        },
      ],
    };

    const mockResponse2: PaginatedResponse<ListItemNoImageNoSubtitle> = {
      $meta: { pagination: { offset: 2, limit: 2, total: 4 } },
      data: [
        {
          id: 'ENR-1234-7564-3475',
          status: 'Failed',
        },
        {
          id: 'ENR-1234-7564-3474',
          status: 'Failed',
        },
      ],
    };

    mockGet.mockResolvedValueOnce(mockResponse1);
    mockGet.mockResolvedValueOnce(mockResponse2);

    let res1: PaginatedResponse<ListItemNoImageNoSubtitle> | undefined;
    let res2: PaginatedResponse<ListItemNoImageNoSubtitle> | undefined;

    await act(async () => {
      res1 = await api.getEnrollments(0, 2);
    });

    await act(async () => {
      res2 = await api.getEnrollments(2, 2);
    });

    expect(res1).toBeDefined();
    expect(res1!.data.length).toBe(2);
    expect(res1!.data.map((item) => item.id)).toEqual(['ENR-1234-7564-2273', 'ENR-1234-7564-3476']);
    expect(res1!.data.map((item) => item.status)).toEqual(['Completed', 'Completed']);

    expect(res2).toBeDefined();
    expect(res2!.data.length).toBe(2);
    expect(res2!.data.map((item) => item.id)).toEqual(['ENR-1234-7564-3475', 'ENR-1234-7564-3474']);
    expect(res2!.data.map((item) => item.status)).toEqual(['Failed', 'Failed']);
  });

  it('returns correct enrollment data structure', async () => {
    const api = setup();
    const mockEnrollment: ListItemNoImageNoSubtitle = {
      id: 'ENR-1234-7564-3481',
      status: 'Completed',
    };

    const mockResponse: PaginatedResponse<ListItemNoImageNoSubtitle> = {
      $meta: {
        pagination: {
          offset: 0,
          limit: 10,
          total: 1,
        },
      },
      data: [mockEnrollment],
    };

    mockGet.mockResolvedValueOnce(mockResponse);

    let res;
    await act(async () => {
      res = await api.getEnrollments();
    });

    expect(res).toEqual(mockResponse);
    expect(res!.data[0]).toMatchObject({
      id: 'ENR-1234-7564-3481',
      status: 'Completed',
    });
  });

  it('handles API errors correctly', async () => {
    const api = setup();
    const mockError = new Error('Network error');

    mockGet.mockRejectedValueOnce(mockError);

    await expect(api.getEnrollments()).rejects.toThrow('Network error');
  });
});

describe('useEnrollmentApi - getEnrollmentData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getEnrollmentData with correct endpoint and returns data', async () => {
    const api = setup();

    let res;

    mockGet.mockResolvedValueOnce(mockEnrollmentData);

    await act(async () => {
      res = await api.getEnrollmentData(mockEnrollmentId1);
    });

    expect(mockGet).toHaveBeenCalledWith(expectedEnrollmentUrl1);
    expect(res).toEqual(mockEnrollmentData);
  });

  it('handles API errors correctly', async () => {
    const api = setup();

    mockGet.mockRejectedValueOnce(mockNetworkError);

    await expect(api.getEnrollmentData(mockEnrollmentId1)).rejects.toThrow('Network error');
  });

  it('handles multiple calls correctly', async () => {
    const api = setup();

    let res1;
    let res2;

    mockGet.mockResolvedValueOnce(mockEnrollmentResponse1);
    mockGet.mockResolvedValueOnce(mockEnrollmentResponse2);

    await act(async () => {
      res1 = await api.getEnrollmentData(mockEnrollmentId1);
    });

    await act(async () => {
      res2 = await api.getEnrollmentData(mockEnrollmentId2);
    });

    expect(mockGet).toHaveBeenNthCalledWith(1, expectedEnrollmentUrl1);
    expect(mockGet).toHaveBeenNthCalledWith(2, expectedEnrollmentUrl2);

    expect(res1).toEqual(mockEnrollmentResponse1);
    expect(res2).toEqual(mockEnrollmentResponse2);
  });
});

describe('useEnrollmentApi - getEnrollments with optional query', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call getEnrollments with a valid custom query', async () => {
    const api = setup();
    const customQuery = `&eq(status,'Processing')&lt(audit.processing.at,2026-02-20)&order=-audit.created.at`;
    const mockResponse: PaginatedResponse<ListItemNoImageNoSubtitle> = {
      $meta: { pagination: { offset: 0, limit: DEFAULT_PAGE_SIZE, total: 0 } },
      data: [],
    };

    mockGet.mockResolvedValueOnce(mockResponse);

    let res;
    await act(async () => {
      res = await api.getEnrollments(undefined, undefined, customQuery);
    });

    const expectedUrl =
      `/v1/program/enrollments` +
      `?select=-*,id,status` +
      `${customQuery}` +
      `&offset=${DEFAULT_OFFSET}` +
      `&limit=${DEFAULT_PAGE_SIZE}`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('should call getEnrollments without query and fallback to default currentQuery', async () => {
    const api = setup();
    const mockResponse: PaginatedResponse<ListItemNoImageNoSubtitle> = {
      $meta: { pagination: { offset: 0, limit: DEFAULT_PAGE_SIZE, total: 0 } },
      data: [],
    };

    mockGet.mockResolvedValueOnce(mockResponse);

    let res;
    await act(async () => {
      res = await api.getEnrollments();
    });

    const defaultQuery = '&order=-id';
    const expectedUrl =
      `/v1/program/enrollments` +
      `?select=-*,id,status` +
      `${defaultQuery}` +
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

    await expect(api.getEnrollments(undefined, undefined, invalidQuery)).rejects.toThrow(
      'Invalid query',
    );

    const expectedUrl =
      `/v1/program/enrollments` +
      `?select=-*,id,status` +
      `${invalidQuery}` +
      `&offset=${DEFAULT_OFFSET}` +
      `&limit=${DEFAULT_PAGE_SIZE}`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
  });
});
