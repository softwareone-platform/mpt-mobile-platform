import { renderHook } from '@testing-library/react-native';

import { useApi } from '@/hooks/useApi';
import { useChatApi } from '@/services/chatService';
import type { ChatItem, CreateChatPayload } from '@/types/chat';

jest.mock('@/hooks/useApi', () => ({
  useApi: jest.fn(),
}));

jest.mock('@/services/loggerService', () => ({
  logger: { debug: jest.fn(), error: jest.fn() },
}));

const mockPost = jest.fn();
const mockUseApi = useApi as jest.Mock;

const mockPayload: CreateChatPayload = {
  type: 'Direct',
  participants: [{ contact: { id: 'CON-0001' } }],
};

const mockChat: ChatItem = {
  id: 'CHT-0001',
  type: 'Direct',
  participants: [],
};

describe('useChatApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseApi.mockReturnValue({ get: jest.fn(), post: mockPost });
  });

  describe('createChat', () => {
    it('posts to /v1/helpdesk/chats with the payload', async () => {
      mockPost.mockResolvedValue(mockChat);

      const { result } = renderHook(() => useChatApi());
      await result.current.createChat(mockPayload);

      expect(mockPost).toHaveBeenCalledWith('/v1/helpdesk/chats', mockPayload);
    });

    it('returns the created chat', async () => {
      mockPost.mockResolvedValue(mockChat);

      const { result } = renderHook(() => useChatApi());
      const chat = await result.current.createChat(mockPayload);

      expect(chat).toBe(mockChat);
    });

    it('re-throws when the api call fails', async () => {
      const error = new Error('Network error');
      mockPost.mockRejectedValue(error);

      const { result } = renderHook(() => useChatApi());

      await expect(result.current.createChat(mockPayload)).rejects.toThrow('Network error');
    });
  });
});
