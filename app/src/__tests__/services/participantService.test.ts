import { renderHook, act } from '@testing-library/react-native';

jest.mock('@/services/loggerService', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

import { useParticipantApi } from '@/services/participantService';
import type { ChatParticipant } from '@/types/chat';

const mockPut = jest.fn();

jest.mock('@/hooks/useApi', () => ({
  useApi: () => ({
    put: mockPut,
  }),
}));

const setup = (chatId: string) => renderHook(() => useParticipantApi(chatId)).result.current;

const chatId = 'CHAT-123';
const participantId = 'P-456';

const mockParticipant: ChatParticipant = {
  id: participantId,
  identity: { id: 'USR-1', name: 'Test User', revision: 1 },
  unreadMessageCount: 0,
  lastReadMessage: { id: 'MSG-100' },
  status: 'Active',
  revision: 1,
};

describe('useParticipantApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveParticipant', () => {
    it('calls api.put with correct endpoint and participant data', async () => {
      const api = setup(chatId);
      const participantUpdate: Partial<ChatParticipant> = {
        id: participantId,
        lastReadMessage: { id: 'MSG-200' },
      };

      mockPut.mockResolvedValueOnce(mockParticipant);

      let result;
      await act(async () => {
        result = await api.saveParticipant(participantUpdate);
      });

      const expectedUrl = `/v1/helpdesk/chats/${chatId}/participants/${participantId}`;

      expect(mockPut).toHaveBeenCalledWith(expectedUrl, participantUpdate);
      expect(result).toEqual(mockParticipant);
    });

    it('throws error when participant ID is missing', async () => {
      const api = setup(chatId);
      const participantUpdate: Partial<ChatParticipant> = {
        lastReadMessage: { id: 'MSG-200' },
      };

      await expect(api.saveParticipant(participantUpdate)).rejects.toThrow(
        'Participant ID is required',
      );

      expect(mockPut).not.toHaveBeenCalled();
    });

    it('updates only lastReadMessage field', async () => {
      const api = setup(chatId);
      const participantUpdate: Partial<ChatParticipant> = {
        id: participantId,
        lastReadMessage: { id: 'MSG-300' },
      };

      mockPut.mockResolvedValueOnce({
        ...mockParticipant,
        lastReadMessage: { id: 'MSG-300' },
      });

      let result;
      await act(async () => {
        result = await api.saveParticipant(participantUpdate);
      });

      expect(mockPut).toHaveBeenCalledWith(
        `/v1/helpdesk/chats/${chatId}/participants/${participantId}`,
        participantUpdate,
      );
      expect(result).toHaveProperty('lastReadMessage.id', 'MSG-300');
    });

    it('handles API errors gracefully', async () => {
      const api = setup(chatId);
      const participantUpdate: Partial<ChatParticipant> = {
        id: participantId,
        lastReadMessage: { id: 'MSG-400' },
      };

      const mockError = new Error('API error');
      mockPut.mockRejectedValueOnce(mockError);

      await expect(api.saveParticipant(participantUpdate)).rejects.toThrow('API error');

      expect(mockPut).toHaveBeenCalledWith(
        `/v1/helpdesk/chats/${chatId}/participants/${participantId}`,
        participantUpdate,
      );
    });

    it('includes chatId in endpoint correctly', async () => {
      const differentChatId = 'CHAT-999';
      const api = setup(differentChatId);
      const participantUpdate: Partial<ChatParticipant> = {
        id: participantId,
        lastReadMessage: { id: 'MSG-500' },
      };

      mockPut.mockResolvedValueOnce(mockParticipant);

      await act(async () => {
        await api.saveParticipant(participantUpdate);
      });

      const expectedUrl = `/v1/helpdesk/chats/${differentChatId}/participants/${participantId}`;

      expect(mockPut).toHaveBeenCalledWith(expectedUrl, participantUpdate);
    });
  });
});
