import { renderHook } from '@testing-library/react-native';

import { useApi } from '@/hooks/useApi';
import { useCaseApi } from '@/services/caseService';
import type { CaseItem } from '@/types/chat';

jest.mock('@/hooks/useApi', () => ({
  useApi: jest.fn(),
}));

const mockGet = jest.fn();
const mockUseApi = useApi as jest.Mock;

const mockCaseItem: CaseItem = {
  id: 'CAS-0001',
  chat: { id: 'CHT-0001' },
};

describe('useCaseApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseApi.mockReturnValue({ get: mockGet });
  });

  describe('getCaseByChatId', () => {
    it('calls the correct endpoint with the chat id', async () => {
      mockGet.mockResolvedValue({ data: [mockCaseItem] });

      const { result } = renderHook(() => useCaseApi());
      await result.current.getCaseByChatId('CHT-0001');

      expect(mockGet).toHaveBeenCalledWith(
        '/v1/helpdesk/cases?select=chat&eq(chat.id,"CHT-0001")&offset=0&limit=1',
      );
    });

    it('returns the first case item from the response', async () => {
      mockGet.mockResolvedValue({ data: [mockCaseItem] });

      const { result } = renderHook(() => useCaseApi());
      const caseItem = await result.current.getCaseByChatId('CHT-0001');

      expect(caseItem).toBe(mockCaseItem);
    });

    it('returns null when the response contains no cases', async () => {
      mockGet.mockResolvedValue({ data: [] });

      const { result } = renderHook(() => useCaseApi());
      const caseItem = await result.current.getCaseByChatId('CHT-0001');

      expect(caseItem).toBeNull();
    });
  });
});
