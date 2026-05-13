import { renderHook, act } from '@testing-library/react-native';

import {
  customQuery,
  invalidQuery,
  expectedUrlCustomQuery,
  expectedUrlInvalidQuery,
  mockResponseEmptyData,
  expectedUrlDefaultOffset,
  expectedUrlCustomOffset,
  mockResponseCustomOffset,
  mockResponse1,
  mockResponse2,
  mockQuoteValid,
  mockResponseValid,
  CUSTOM_OFFSET,
  CUSTOM_PAGE_SIZE,
} from '../__mocks__/services/salesQuote';

import { useSalesQuoteApi } from '@/services/salesQuoteService';
import type { PaginatedResponse, ListItemNoImageWithExternalIds } from '@/types/api';

const mockGet = jest.fn();

jest.mock('@/hooks/useApi', () => ({
  useApi: () => ({
    get: mockGet,
  }),
}));

const setup = () => renderHook(() => useSalesQuoteApi()).result.current;

describe('useSalesQuoteApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getSalesQuotes with default offset and limit', async () => {
    const api = setup();

    mockGet.mockResolvedValueOnce(mockResponseEmptyData);

    let res;

    await act(async () => {
      res = await api.getSalesQuotes();
    });

    expect(mockGet).toHaveBeenCalledWith(expectedUrlDefaultOffset);
    expect(res).toEqual(mockResponseEmptyData);
  });

  it('calls getSalesQuotes with custom offset and limit', async () => {
    const api = setup();

    mockGet.mockResolvedValueOnce(mockResponseCustomOffset);

    let res;

    await act(async () => {
      res = await api.getSalesQuotes(CUSTOM_OFFSET, CUSTOM_PAGE_SIZE);
    });

    expect(mockGet).toHaveBeenCalledWith(expectedUrlCustomOffset);
    expect(res).toEqual(mockResponseCustomOffset);
  });

  it('handles multiple calls correctly', async () => {
    const api = setup();

    mockGet.mockResolvedValueOnce(mockResponse1);
    mockGet.mockResolvedValueOnce(mockResponse2);

    let res1: PaginatedResponse<ListItemNoImageWithExternalIds> | undefined;
    let res2: PaginatedResponse<ListItemNoImageWithExternalIds> | undefined;

    await act(async () => {
      res1 = await api.getSalesQuotes(0, 2);
    });

    await act(async () => {
      res2 = await api.getSalesQuotes(2, 2);
    });

    expect(res1).toBeDefined();
    expect(res1!.data.length).toBe(2);

    expect(res1!.data.map((item) => item.id)).toEqual(['SQT-7839-0957-0317', 'SQT-9568-0315-3598']);

    expect(res2).toBeDefined();
    expect(res2!.data.length).toBe(2);

    expect(res2!.data.map((item) => item.id)).toEqual(['SQT-1111-2222-3333', 'SQT-4444-5555-6666']);
  });

  it('returns correct sales quote data structure', async () => {
    const api = setup();

    mockGet.mockResolvedValueOnce(mockResponseValid);

    let res;

    await act(async () => {
      res = await api.getSalesQuotes();
    });

    expect(res).toEqual(mockResponseValid);

    expect(res!.data[0]).toMatchObject(mockQuoteValid);
  });

  it('handles API errors correctly', async () => {
    const api = setup();

    const mockError = new Error('Network error');

    mockGet.mockRejectedValueOnce(mockError);

    await expect(api.getSalesQuotes()).rejects.toThrow('Network error');
  });
});

describe('useSalesQuoteApi - getSalesQuotes with optional query', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getSalesQuotes with custom query', async () => {
    const api = setup();

    mockGet.mockResolvedValueOnce(mockResponseEmptyData);

    let res;

    await act(async () => {
      res = await api.getSalesQuotes(undefined, undefined, customQuery);
    });

    expect(mockGet).toHaveBeenCalledWith(expectedUrlCustomQuery);
    expect(res).toEqual(mockResponseEmptyData);
  });

  it('falls back to default query when none provided', async () => {
    const api = setup();

    mockGet.mockResolvedValueOnce(mockResponseEmptyData);

    let res;

    await act(async () => {
      res = await api.getSalesQuotes();
    });

    expect(mockGet).toHaveBeenCalledWith(expectedUrlDefaultOffset);
    expect(res).toEqual(mockResponseEmptyData);
  });

  it('throws error when API rejects due to invalid query', async () => {
    const api = setup();

    const mockError = new Error('Invalid query');

    mockGet.mockRejectedValueOnce(mockError);

    await expect(api.getSalesQuotes(undefined, undefined, invalidQuery)).rejects.toThrow(
      'Invalid query',
    );

    expect(mockGet).toHaveBeenCalledWith(expectedUrlInvalidQuery);
  });
});
