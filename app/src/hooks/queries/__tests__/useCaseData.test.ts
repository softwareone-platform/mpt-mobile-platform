import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';

import { useCaseData } from '@/hooks/queries/useCaseData';
import { useCaseApi } from '@/services/caseService';
import type { CaseItem } from '@/types/chat';

jest.mock('@/services/caseService', () => ({
  useCaseApi: jest.fn(),
}));

const mockGetCaseByChatId = jest.fn();
const mockUseCaseApi = useCaseApi as jest.Mock;

const mockCaseItem: CaseItem = {
  id: 'CAS-0001',
  chat: { id: 'CHT-0001' },
};

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useCaseData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCaseApi.mockReturnValue({ getCaseByChatId: mockGetCaseByChatId });
  });

  it('returns case data for a given chatId', async () => {
    mockGetCaseByChatId.mockResolvedValue(mockCaseItem);

    const { result } = renderHook(() => useCaseData('CHT-0001', true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBe(mockCaseItem);
    expect(mockGetCaseByChatId).toHaveBeenCalledWith('CHT-0001');
  });

  it('does not fetch when enabled is false', () => {
    const { result } = renderHook(() => useCaseData('CHT-0001', false), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockGetCaseByChatId).not.toHaveBeenCalled();
  });

  it('does not fetch when chatId is undefined', () => {
    const { result } = renderHook(() => useCaseData(undefined, true), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockGetCaseByChatId).not.toHaveBeenCalled();
  });
});
