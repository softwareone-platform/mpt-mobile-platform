import { renderHook, act } from '@testing-library/react-native';

import { mockNetworkError } from '../__mocks__/services/common';
import {
  mockSellerId1,
  mockSellerId2,
  expectedSellerUrl1,
  expectedSellerUrl2,
  mockSellerData,
  mockSellerResponse1,
  mockSellerResponse2,
} from '../__mocks__/services/seller';

import { useSellerApi } from '@/services/sellerService';

const mockGet = jest.fn();

jest.mock('@/hooks/useApi', () => ({
  useApi: () => ({
    get: mockGet,
  }),
}));

const setup = () => renderHook(() => useSellerApi()).result.current;

describe('useSellerApi - getSellerData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getSellerData with correct endpoint and returns data', async () => {
    const api = setup();

    let res;

    mockGet.mockResolvedValueOnce(mockSellerData);

    await act(async () => {
      res = await api.getSellerData(mockSellerId1);
    });

    expect(mockGet).toHaveBeenCalledWith(expectedSellerUrl1);
    expect(res).toEqual(mockSellerData);
  });

  it('handles API errors correctly', async () => {
    const api = setup();

    mockGet.mockRejectedValueOnce(mockNetworkError);

    await expect(api.getSellerData(mockSellerId1)).rejects.toThrow('Network error');
  });

  it('handles multiple calls correctly', async () => {
    const api = setup();

    let res1;
    let res2;

    mockGet.mockResolvedValueOnce(mockSellerResponse1);
    mockGet.mockResolvedValueOnce(mockSellerResponse2);

    await act(async () => {
      res1 = await api.getSellerData(mockSellerId1);
    });

    await act(async () => {
      res2 = await api.getSellerData(mockSellerId2);
    });

    expect(mockGet).toHaveBeenNthCalledWith(1, expectedSellerUrl1);
    expect(mockGet).toHaveBeenNthCalledWith(2, expectedSellerUrl2);

    expect(res1).toEqual(mockSellerResponse1);
    expect(res2).toEqual(mockSellerResponse2);
  });
});
