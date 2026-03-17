import { renderHook, act } from '@testing-library/react-native';

jest.mock('@/services/loggerService', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useChatApi } from '@/services/chatService';
import type { PaginatedResponse } from '@/types/api';
import type { ChatItem } from '@/types/chat';

const mockGet = jest.fn();

jest.mock('@/hooks/useApi', () => ({
  useApi: () => ({
    get: mockGet,
  }),
}));

const setup = () => renderHook(() => useChatApi()).result.current;

const userId = 'USR-123';

const mockChatItem: ChatItem = {
  id: 'CHAT-1',
  name: 'Test Chat',
  type: 'Direct',
  participants: [
    {
      id: 'P-1',
      identity: { id: userId, name: 'Current User', revision: 1 },
      unreadMessageCount: 0,
    },
  ],
  lastMessage: {
    id: 'MSG-1',
    content: 'Test message',
    audit: { created: { at: '2026-03-16T10:00:00Z', by: 'USER-1' } },
    isDeleted: false,
  },
};

const expectedUrlBase =
  `/v1/helpdesk/chats` +
  `?select=participants,lastMessage,lastMessage.audit,lastMessage.sender` +
  `&any(participants,eq(identity.id,"${userId}"))` +
  `&order=-lastMessage.audit.created.at`;

describe('useChatApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getChats', () => {
    it('calls api.get with correct endpoint and default offset/limit', async () => {
      const api = setup();
      const mockResponse: PaginatedResponse<ChatItem> = {
        $meta: {
          pagination: {
            offset: DEFAULT_OFFSET,
            limit: DEFAULT_PAGE_SIZE,
            total: 1,
          },
        },
        data: [mockChatItem],
      };

      mockGet.mockResolvedValueOnce(mockResponse);

      let result;
      await act(async () => {
        result = await api.getChats(userId);
      });

      const expectedUrl =
        expectedUrlBase + `&offset=${DEFAULT_OFFSET}` + `&limit=${DEFAULT_PAGE_SIZE}`;

      expect(mockGet).toHaveBeenCalledWith(expectedUrl);
      expect(result).toEqual(mockResponse);
    });

    it('calls api.get with custom offset and limit', async () => {
      const api = setup();
      const mockResponse: PaginatedResponse<ChatItem> = {
        $meta: {
          pagination: {
            offset: 20,
            limit: 10,
            total: 50,
          },
        },
        data: [mockChatItem],
      };

      mockGet.mockResolvedValueOnce(mockResponse);

      let result;
      await act(async () => {
        result = await api.getChats(userId, 20, 10);
      });

      const expectedUrl = expectedUrlBase + `&offset=20` + `&limit=10`;

      expect(mockGet).toHaveBeenCalledWith(expectedUrl);
      expect(result).toEqual(mockResponse);
    });

    it('constructs endpoint with proper RQL filter for userId', async () => {
      const api = setup();
      const specificUserId = 'USER-456';
      const mockResponse: PaginatedResponse<ChatItem> = {
        $meta: {
          pagination: {
            offset: 0,
            limit: DEFAULT_PAGE_SIZE,
            total: 0,
          },
        },
        data: [],
      };

      mockGet.mockResolvedValueOnce(mockResponse);

      await act(async () => {
        await api.getChats(specificUserId);
      });

      const expectedUrl =
        `/v1/helpdesk/chats` +
        `?select=participants,lastMessage,lastMessage.audit,lastMessage.sender` +
        `&any(participants,eq(identity.id,"${specificUserId}"))` +
        `&order=-lastMessage.audit.created.at` +
        `&offset=0` +
        `&limit=${DEFAULT_PAGE_SIZE}`;

      expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    });

    it('returns response with empty data array when no chats found', async () => {
      const api = setup();
      const mockResponse: PaginatedResponse<ChatItem> = {
        $meta: {
          pagination: {
            offset: 0,
            limit: DEFAULT_PAGE_SIZE,
            total: 0,
          },
        },
        data: [],
      };

      mockGet.mockResolvedValueOnce(mockResponse);

      let result: PaginatedResponse<ChatItem> | undefined;
      await act(async () => {
        result = await api.getChats(userId);
      });

      expect(result).toEqual(mockResponse);
      expect(result!.data).toEqual([]);
    });

    it('returns response with multiple chat items', async () => {
      const api = setup();
      const mockChatItem2: ChatItem = {
        ...mockChatItem,
        id: 'CHAT-2',
        name: 'Another Chat',
        type: 'Group',
      };

      const mockResponse: PaginatedResponse<ChatItem> = {
        $meta: {
          pagination: {
            offset: 0,
            limit: DEFAULT_PAGE_SIZE,
            total: 2,
          },
        },
        data: [mockChatItem, mockChatItem2],
      };

      mockGet.mockResolvedValueOnce(mockResponse);

      let result: PaginatedResponse<ChatItem> | undefined;
      await act(async () => {
        result = await api.getChats(userId);
      });

      expect(result!.data).toHaveLength(2);
      expect(result!.data[0].id).toBe('CHAT-1');
      expect(result!.data[1].id).toBe('CHAT-2');
    });

    it('handles API errors', async () => {
      const api = setup();
      const mockError = new Error('API Error');

      mockGet.mockRejectedValueOnce(mockError);

      await expect(async () => {
        await act(async () => {
          await api.getChats(userId);
        });
      }).rejects.toThrow('API Error');
    });

    it('includes select parameters for nested data in endpoint', async () => {
      const api = setup();
      const mockResponse: PaginatedResponse<ChatItem> = {
        $meta: {
          pagination: {
            offset: 0,
            limit: DEFAULT_PAGE_SIZE,
            total: 0,
          },
        },
        data: [],
      };

      mockGet.mockResolvedValueOnce(mockResponse);

      await act(async () => {
        await api.getChats(userId);
      });

      const calledUrl = mockGet.mock.calls[0][0];
      expect(calledUrl).toContain(
        'select=participants,lastMessage,lastMessage.audit,lastMessage.sender',
      );
    });

    it('includes order parameter for sorting by last message date in endpoint', async () => {
      const api = setup();
      const mockResponse: PaginatedResponse<ChatItem> = {
        $meta: {
          pagination: {
            offset: 0,
            limit: DEFAULT_PAGE_SIZE,
            total: 0,
          },
        },
        data: [],
      };

      mockGet.mockResolvedValueOnce(mockResponse);

      await act(async () => {
        await api.getChats(userId);
      });

      const calledUrl = mockGet.mock.calls[0][0];
      expect(calledUrl).toContain('order=-lastMessage.audit.created.at');
    });
  });
});
