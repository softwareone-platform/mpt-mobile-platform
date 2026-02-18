import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';

import { useProductDetailsData } from '@/hooks/queries/useProductDetailsData';

const mockGetProductData = jest.fn();

jest.mock('@/services/productService', () => ({
  useProductApi: () => ({
    getProductData: mockGetProductData,
  }),
}));

jest.mock('@/utils/apiError', () => ({
  isUnauthorisedError: jest.fn(() => false),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useProductDetailsData', () => {
  const mockProductId = 'PRD-7208-0459';
  const mockUserId = 'USR-1234';
  const mockAccountId = 'ACC-5678';
  const mockProductData = {
    id: mockProductId,
    name: 'Test Product',
    vendor: {
      id: 'ACC-3805-2089',
      name: 'Test Vendor',
    },
    status: 'Published',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches product data successfully when all parameters are provided', async () => {
    mockGetProductData.mockResolvedValueOnce(mockProductData);

    const { result } = renderHook(
      () => useProductDetailsData(mockProductId, mockUserId, mockAccountId),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockGetProductData).toHaveBeenCalledWith(mockProductId);
    expect(result.current.data).toEqual(mockProductData);
  });

  it('does not fetch when productId is undefined', () => {
    const { result } = renderHook(
      () => useProductDetailsData(undefined, mockUserId, mockAccountId),
      { wrapper: createWrapper() },
    );

    expect(result.current.isLoading).toBe(false);
    expect(mockGetProductData).not.toHaveBeenCalled();
  });

  it('does not fetch when userId is undefined', () => {
    const { result } = renderHook(
      () => useProductDetailsData(mockProductId, undefined, mockAccountId),
      { wrapper: createWrapper() },
    );

    expect(result.current.isLoading).toBe(false);
    expect(mockGetProductData).not.toHaveBeenCalled();
  });

  it('does not fetch when accountId is undefined', () => {
    const { result } = renderHook(
      () => useProductDetailsData(mockProductId, mockUserId, undefined),
      { wrapper: createWrapper() },
    );

    expect(result.current.isLoading).toBe(false);
    expect(mockGetProductData).not.toHaveBeenCalled();
  });

  it('handles errors correctly', async () => {
    const error = new Error('Failed to fetch product');
    mockGetProductData.mockRejectedValueOnce(error);

    const { result } = renderHook(
      () => useProductDetailsData(mockProductId, mockUserId, mockAccountId),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(error);
  });
});
