import { renderHook, act } from '@testing-library/react-native';

import { mockNetworkError } from '../__mocks__/services/common';
import {
  mockProductId1,
  mockProductId2,
  expectedProductUrl1,
  expectedProductUrl2,
  mockProductData,
  mockProductResponse1,
  mockProductResponse2,
} from '../__mocks__/services/product';

import { useProductApi } from '@/services/productService';

const mockGet = jest.fn();

jest.mock('@/hooks/useApi', () => ({
  useApi: () => ({
    get: mockGet,
  }),
}));

const setup = () => renderHook(() => useProductApi()).result.current;

describe('useProductApi - getProductData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getProductData with correct endpoint and returns data', async () => {
    const api = setup();

    let res;

    mockGet.mockResolvedValueOnce(mockProductData);

    await act(async () => {
      res = await api.getProductData(mockProductId1);
    });

    expect(mockGet).toHaveBeenCalledWith(expectedProductUrl1);
    expect(res).toEqual(mockProductData);
  });

  it('handles API errors correctly', async () => {
    const api = setup();

    mockGet.mockRejectedValueOnce(mockNetworkError);

    await expect(api.getProductData(mockProductId1)).rejects.toThrow('Network error');
  });

  it('handles multiple calls correctly', async () => {
    const api = setup();

    let res1;
    let res2;

    mockGet.mockResolvedValueOnce(mockProductResponse1);
    mockGet.mockResolvedValueOnce(mockProductResponse2);

    await act(async () => {
      res1 = await api.getProductData(mockProductId1);
    });

    await act(async () => {
      res2 = await api.getProductData(mockProductId2);
    });

    expect(mockGet).toHaveBeenNthCalledWith(1, expectedProductUrl1);
    expect(mockGet).toHaveBeenNthCalledWith(2, expectedProductUrl2);

    expect(res1).toEqual(mockProductResponse1);
    expect(res2).toEqual(mockProductResponse2);
  });
});
