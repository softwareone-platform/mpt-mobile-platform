import { renderHook, act } from '@testing-library/react-native';

import {
  mockJournalId1,
  mockJournalId2,
  mockJournalResponse1,
  mockJournalResponse2,
  mockJournalData,
  expectedUrl1,
  expectedUrl2,
} from '../__mocks__/services/journal';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useBillingApi } from '@/services/billingService';
import type { PaginatedResponse, ListItemNoImage } from '@/types/api';

const mockGet = jest.fn();

jest.mock('@/hooks/useApi', () => ({
  useApi: () => ({
    get: mockGet,
  }),
}));

const setup = () => renderHook(() => useBillingApi()).result.current;

const expectedUrlBase =
  `/v1/billing/journals` +
  `?select=-*,id,name,status` +
  `&ne(status,%22Deleted%22)` +
  `&order=-audit.created.at`;

describe('useBillingApi - Journals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getJournals - calls with default offset and limit', async () => {
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
      expectedUrlBase + `&offset=${DEFAULT_OFFSET}` + `&limit=${DEFAULT_PAGE_SIZE}`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('getJournals - calls with custom offset and limit', async () => {
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

    const expectedUrl = expectedUrlBase + `&offset=50` + `&limit=25`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual(mockResponse);
  });

  it('getJournals - handles multiple calls correctly', async () => {
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

  it('getJournals - returns journals with correct structure for list view', async () => {
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

  it('getJournals - handles API errors correctly', async () => {
    const api = setup();
    const mockError = new Error('Network error');

    mockGet.mockRejectedValueOnce(mockError);

    await expect(api.getJournals()).rejects.toThrow('Network error');
  });

  it('getJournalData - calls with correct endpoint and returns data required for details view', async () => {
    const api = setup();

    let res;

    mockGet.mockResolvedValueOnce(mockJournalData);

    await act(async () => {
      res = await api.getJournalData(mockJournalId1);
    });

    expect(mockGet).toHaveBeenCalledWith(expectedUrl1);
    expect(res).toEqual(mockJournalData);
  });

  it('getJournalData - handles API errors correctly', async () => {
    const api = setup();
    const mockError = new Error('Network error');

    mockGet.mockRejectedValueOnce(mockError);

    await expect(api.getJournalData(mockJournalId1)).rejects.toThrow('Network error');
  });

  it('getJournalData - handles multiple calls correctly', async () => {
    const api = setup();

    let res1;
    let res2;

    mockGet.mockResolvedValueOnce(mockJournalResponse1);
    mockGet.mockResolvedValueOnce(mockJournalResponse2);

    await act(async () => {
      res1 = await api.getJournalData(mockJournalId1);
    });

    await act(async () => {
      res2 = await api.getJournalData(mockJournalId2);
    });

    expect(mockGet).toHaveBeenNthCalledWith(1, expectedUrl1);
    expect(mockGet).toHaveBeenNthCalledWith(2, expectedUrl2);

    expect(res1).toEqual(mockJournalResponse1);
    expect(res2).toEqual(mockJournalResponse2);
  });
});
