import { renderHook, act } from '@testing-library/react-native';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useProgramApi } from '@/services/programService';
import type { PaginatedResponse } from '@/types/api';
import type { Program } from '@/types/program';

const mockGet = jest.fn();

jest.mock('@/hooks/useApi', () => ({
  useApi: () => ({
    get: mockGet,
  }),
}));

const setup = () => renderHook(() => useProgramApi()).result.current;

describe('useProgramApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getPrograms with default offset and limit', async () => {
    const api = setup();
    const mockResponse: PaginatedResponse<Program> = {
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
      res = await api.getPrograms();
    });

    const expectedUrl =
      `/v1/program/programs` +
      `?select=audit&ne(status,%22Deleted%22)` +
      `&order=name` +
      `&offset=${DEFAULT_OFFSET}` +
      `&limit=${DEFAULT_PAGE_SIZE}`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('calls getPrograms with custom offset and limit', async () => {
    const api = setup();
    const mockResponse: PaginatedResponse<Program> = {
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
      res = await api.getPrograms(50, 25);
    });

    const expectedUrl =
      `/v1/program/programs` +
      `?select=audit&ne(status,%22Deleted%22)` +
      `&order=name` +
      `&offset=50` +
      `&limit=25`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('handles multiple calls correctly', async () => {
    const api = setup();

    const mockResponse1: PaginatedResponse<Program> = {
      $meta: { pagination: { offset: 0, limit: 2, total: 4 } },
      data: [
        {
          id: 'PRG-0001',
          name: 'Partner Program',
          status: 'Active',
        } as Program,
        {
          id: 'PRG-0002',
          name: 'Reseller Program',
          status: 'Active',
        } as Program,
      ],
    };

    const mockResponse2: PaginatedResponse<Program> = {
      $meta: { pagination: { offset: 2, limit: 2, total: 4 } },
      data: [
        {
          id: 'PRG-0003',
          name: 'Enterprise Program',
          status: 'Inactive',
        } as Program,
        {
          id: 'PRG-0004',
          name: 'Starter Program',
          status: 'Active',
        } as Program,
      ],
    };

    mockGet.mockResolvedValueOnce(mockResponse1);
    mockGet.mockResolvedValueOnce(mockResponse2);

    let res1: PaginatedResponse<Program> | undefined;
    let res2: PaginatedResponse<Program> | undefined;

    await act(async () => {
      res1 = await api.getPrograms(0, 2);
    });

    await act(async () => {
      res2 = await api.getPrograms(2, 2);
    });

    expect(res1).toBeDefined();
    expect(res1!.data.length).toBe(2);
    expect(res1!.data.map((item) => item.id)).toEqual(['PRG-0001', 'PRG-0002']);
    expect(res1!.data.map((item) => item.name)).toEqual(['Partner Program', 'Reseller Program']);

    expect(res2).toBeDefined();
    expect(res2!.data.length).toBe(2);
    expect(res2!.data.map((item) => item.id)).toEqual(['PRG-0003', 'PRG-0004']);
    expect(res2!.data.map((item) => item.status)).toEqual(['Inactive', 'Active']);
  });

  it('returns correct program data structure', async () => {
    const api = setup();
    const mockProgram: Program = {
      id: 'PRG-1234',
      name: 'Premium Program',
      status: 'Active',
      icon: 'program-icon.png',
    };

    const mockResponse: PaginatedResponse<Program> = {
      $meta: {
        pagination: {
          offset: 0,
          limit: 10,
          total: 1,
        },
      },
      data: [mockProgram],
    };

    mockGet.mockResolvedValueOnce(mockResponse);

    let res;
    await act(async () => {
      res = await api.getPrograms();
    });

    expect(res).toEqual(mockResponse);
    expect(res!.data[0]).toMatchObject({
      id: 'PRG-1234',
      name: 'Premium Program',
      status: 'Active',
    });
  });

  it('handles API errors correctly', async () => {
    const api = setup();
    const mockError = new Error('Network error');

    mockGet.mockRejectedValueOnce(mockError);

    await expect(api.getPrograms()).rejects.toThrow('Network error');
  });
});
