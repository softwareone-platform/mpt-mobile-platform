import { renderHook, act } from '@testing-library/react-native';

import {
  mockJournalId1,
  mockJournalId2,
  mockJournalResponse1,
  mockJournalResponse2,
} from '../__mocks__/services/journal';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE, JOURNALS_LIST_API_ENDPOINT } from '@/constants/api';
import { useBillingApi } from '@/services/billingService';
import type { PaginatedResponse, ListItemNoImage } from '@/types/api';

const mockGet = jest.fn();

jest.mock('@/hooks/useApi', () => ({
  useApi: () => ({
    get: mockGet,
  }),
}));

const setup = () => renderHook(() => useBillingApi()).result.current;

describe('useBillingApi - Journals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getJournals with default offset and limit', async () => {
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
      res = await api.getJournals();
    });

    const expectedUrl =
      `${JOURNALS_LIST_API_ENDPOINT}` + `&offset=${DEFAULT_OFFSET}` + `&limit=${DEFAULT_PAGE_SIZE}`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('calls getJournals with custom offset and limit', async () => {
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
      res = await api.getJournals(50, 25);
    });

    const expectedUrl = JOURNALS_LIST_API_ENDPOINT + `&offset=50` + `&limit=25`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('handles multiple calls correctly', async () => {
    const api = setup();

    const mockResponse1: PaginatedResponse<ListItemNoImage> = {
      $meta: { pagination: { offset: 0, limit: 2, total: 4 } },
      data: [mockJournalResponse1, mockJournalResponse2],
    };

    const mockResponse2: PaginatedResponse<ListItemNoImage> = {
      $meta: { pagination: { offset: 2, limit: 2, total: 4 } },
      data: [
        { id: 'BJO-1234-7566', name: 'Journal Three', status: 'Validating' },
        { id: 'BJO-1234-7567', name: 'Journal Four', status: 'Completed' },
      ],
    };

    mockGet.mockResolvedValueOnce(mockResponse1);
    mockGet.mockResolvedValueOnce(mockResponse2);

    let res1: PaginatedResponse<ListItemNoImage> | undefined;
    let res2: PaginatedResponse<ListItemNoImage> | undefined;

    await act(async () => {
      res1 = await api.getJournals(0, 2);
    });

    await act(async () => {
      res2 = await api.getJournals(2, 2);
    });

    expect(res1).toBeDefined();
    expect(res1!.data.length).toBe(2);
    expect(res1!.data.map((item) => item.id)).toEqual([mockJournalId1, mockJournalId2]);
    expect(res1!.data.map((item) => item.name)).toEqual(['Journal One', 'Journal Two longer name']);

    expect(res2).toBeDefined();
    expect(res2!.data.length).toBe(2);
    expect(res2!.data.map((item) => item.status)).toEqual(['Validating', 'Completed']);
  });

  it('returns journals with correct structure for list view', async () => {
    const api = setup();
    const mockResponse: PaginatedResponse<ListItemNoImage> = {
      $meta: {
        pagination: {
          offset: 0,
          limit: 10,
          total: 1,
        },
      },
      data: [mockJournalResponse1],
    };

    mockGet.mockResolvedValueOnce(mockResponse);

    let res;
    await act(async () => {
      res = await api.getJournals();
    });

    expect(res).toEqual(mockResponse);
    expect(res!.data[0]).toMatchObject({
      id: 'BJO-1234-7564',
      name: 'Journal One',
      status: 'Draft',
    });
  });

  it('handles API errors correctly', async () => {
    const api = setup();
    const mockError = new Error('Network error');

    mockGet.mockRejectedValueOnce(mockError);

    await expect(api.getJournals()).rejects.toThrow('Network error');
  });
});
