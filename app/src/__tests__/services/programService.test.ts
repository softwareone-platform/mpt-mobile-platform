import { renderHook, act } from '@testing-library/react-native';

import { mockNetworkError } from '../__mocks__/services/common';
import {
  mockProgramId1,
  mockProgramId2,
  mockProgramData,
  expectedProgramUrl1,
  expectedProgramUrl2,
  mockProgramResponse1,
  mockProgramResponse2,
} from '../__mocks__/services/program';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useProgramApi } from '@/services/programService';
import type { PaginatedResponse, ListItemFull } from '@/types/api';

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
    const mockResponse: PaginatedResponse<ListItemFull> = {
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
    const mockResponse: PaginatedResponse<ListItemFull> = {
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

    const mockResponse1: PaginatedResponse<ListItemFull> = {
      $meta: { pagination: { offset: 0, limit: 2, total: 4 } },
      data: [
        {
          id: 'PRG-0001-0001',
          name: 'Partner Program',
          status: 'Published',
        } as ListItemFull,
        {
          id: 'PRG-0002-0002',
          name: 'Reseller Program',
          status: 'Published',
        } as ListItemFull,
      ],
    };

    const mockResponse2: PaginatedResponse<ListItemFull> = {
      $meta: { pagination: { offset: 2, limit: 2, total: 4 } },
      data: [
        {
          id: 'PRG-0003-0003',
          name: 'Enterprise Program',
          status: 'Unpublished',
        } as ListItemFull,
        {
          id: 'PRG-0004-0004',
          name: 'Starter Program',
          status: 'Published',
        } as ListItemFull,
      ],
    };

    mockGet.mockResolvedValueOnce(mockResponse1);
    mockGet.mockResolvedValueOnce(mockResponse2);

    let res1: PaginatedResponse<ListItemFull> | undefined;
    let res2: PaginatedResponse<ListItemFull> | undefined;

    await act(async () => {
      res1 = await api.getPrograms(0, 2);
    });

    await act(async () => {
      res2 = await api.getPrograms(2, 2);
    });

    expect(res1).toBeDefined();
    expect(res1!.data.length).toBe(2);
    expect(res1!.data.map((item) => item.id)).toEqual(['PRG-0001-0001', 'PRG-0002-0002']);
    expect(res1!.data.map((item) => item.name)).toEqual(['Partner Program', 'Reseller Program']);

    expect(res2).toBeDefined();
    expect(res2!.data.length).toBe(2);
    expect(res2!.data.map((item) => item.id)).toEqual(['PRG-0003-0003', 'PRG-0004-0004']);
    expect(res2!.data.map((item) => item.status)).toEqual(['Unpublished', 'Published']);
  });

  it('returns correct program data structure', async () => {
    const api = setup();
    const mockProgram: ListItemFull = {
      id: 'PRG-1234-1234',
      name: 'Premium Program',
      status: 'Published',
      icon: 'program-icon.png',
    };

    const mockResponse: PaginatedResponse<ListItemFull> = {
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
      id: 'PRG-1234-1234',
      name: 'Premium Program',
      status: 'Published',
    });
  });

  it('handles API errors correctly', async () => {
    const api = setup();
    const mockError = new Error('Network error');

    mockGet.mockRejectedValueOnce(mockError);

    await expect(api.getPrograms()).rejects.toThrow('Network error');
  });
});

describe('useProgramApi - getProgramData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getProgramData with correct endpoint and returns data', async () => {
    const api = setup();

    let res;

    mockGet.mockResolvedValueOnce(mockProgramData);

    await act(async () => {
      res = await api.getProgramData(mockProgramId1);
    });

    expect(mockGet).toHaveBeenCalledWith(expectedProgramUrl1);
    expect(res).toEqual(mockProgramData);
  });

  it('handles API errors correctly', async () => {
    const api = setup();

    mockGet.mockRejectedValueOnce(mockNetworkError);

    await expect(api.getProgramData(mockProgramId1)).rejects.toThrow('Network error');
  });

  it('handles multiple calls correctly', async () => {
    const api = setup();

    let res1;
    let res2;

    mockGet.mockResolvedValueOnce(mockProgramResponse1);
    mockGet.mockResolvedValueOnce(mockProgramResponse2);

    await act(async () => {
      res1 = await api.getProgramData(mockProgramId1);
    });

    await act(async () => {
      res2 = await api.getProgramData(mockProgramId2);
    });

    expect(mockGet).toHaveBeenNthCalledWith(1, expectedProgramUrl1);
    expect(mockGet).toHaveBeenNthCalledWith(2, expectedProgramUrl2);

    expect(res1).toEqual(mockProgramResponse1);
    expect(res2).toEqual(mockProgramResponse2);
  });
});
