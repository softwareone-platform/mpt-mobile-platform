import { renderHook, act } from '@testing-library/react-native';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useEnrollmentApi } from '@/services/enrollmentService';
import type { PaginatedResponse } from '@/types/api';
import type { Enrollment } from '@/types/program';

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
    const mockResponse: PaginatedResponse<Enrollment> = {
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
      `?select=audit,certificate.client,program.vendor,licensee.account.id,assignee.currentAccount.id` +
      `&ne(status,%22Deleted%22)` +
      `&order=-id` +
      `&offset=${DEFAULT_OFFSET}` +
      `&limit=${DEFAULT_PAGE_SIZE}`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('calls getEnrollments with custom offset and limit', async () => {
    const api = setup();
    const mockResponse: PaginatedResponse<Enrollment> = {
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
      `?select=audit,certificate.client,program.vendor,licensee.account.id,assignee.currentAccount.id` +
      `&ne(status,%22Deleted%22)` +
      `&order=-id` +
      `&offset=50` +
      `&limit=25`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('handles multiple calls correctly', async () => {
    const api = setup();

    const mockResponse1: PaginatedResponse<Enrollment> = {
      $meta: { pagination: { offset: 0, limit: 2, total: 4 } },
      data: [
        {
          id: 'ENR-1234-7564-2273',
          name: 'ENR-1234-7564-2273',
          status: 'Completed',
        } as Enrollment,
        {
          id: 'ENR-1234-7564-3476',
          name: 'ENR-1234-7564-3476',
          status: 'Completed',
        } as Enrollment,
      ],
    };

    const mockResponse2: PaginatedResponse<Enrollment> = {
      $meta: { pagination: { offset: 2, limit: 2, total: 4 } },
      data: [
        {
          id: 'ENR-1234-7564-3475',
          name: 'ENR-1234-7564-3475',
          status: 'Failed',
        } as Enrollment,
        {
          id: 'ENR-1234-7564-3474',
          name: 'ENR-1234-7564-3474',
          status: 'Failed',
        } as Enrollment,
      ],
    };

    mockGet.mockResolvedValueOnce(mockResponse1);
    mockGet.mockResolvedValueOnce(mockResponse2);

    let res1: PaginatedResponse<Enrollment> | undefined;
    let res2: PaginatedResponse<Enrollment> | undefined;

    await act(async () => {
      res1 = await api.getEnrollments(0, 2);
    });

    await act(async () => {
      res2 = await api.getEnrollments(2, 2);
    });

    expect(res1).toBeDefined();
    expect(res1!.data.length).toBe(2);
    expect(res1!.data.map((item) => item.id)).toEqual(['ENR-1234-7564-2273', 'ENR-1234-7564-3476']);
    expect(res1!.data.map((item) => item.name)).toEqual([
      'ENR-1234-7564-2273',
      'ENR-1234-7564-3476',
    ]);

    expect(res2).toBeDefined();
    expect(res2!.data.length).toBe(2);
    expect(res2!.data.map((item) => item.id)).toEqual(['ENR-1234-7564-3475', 'ENR-1234-7564-3474']);
    expect(res2!.data.map((item) => item.status)).toEqual(['Failed', 'Failed']);
  });

  it('returns correct enrollment data structure', async () => {
    const api = setup();
    const mockEnrollment: Enrollment = {
      id: 'ENR-1234-7564-3481',
      name: 'ENR-1234-7564-3481',
      status: 'Completed',
      icon: 'enrollment-icon.png',
    };

    const mockResponse: PaginatedResponse<Enrollment> = {
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
      name: 'ENR-1234-7564-3481',
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
