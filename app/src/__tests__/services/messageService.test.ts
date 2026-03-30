import { renderHook, act } from '@testing-library/react-native';

jest.mock('@/services/loggerService', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

import { DEFAULT_OFFSET, MESSAGE_PAGE_SIZE } from '@/constants/api';
import { useMessageApi } from '@/services/messageService';
import type { MessageInput } from '@/services/messageService';
import type { PaginatedResponse } from '@/types/api';
import type { Message } from '@/types/chat';

const mockGet = jest.fn();
const mockPost = jest.fn();

jest.mock('@/hooks/useApi', () => ({
  useApi: () => ({
    get: mockGet,
    post: mockPost,
  }),
}));

const chatId = 'CHAT-123';
const setup = () => renderHook(() => useMessageApi(chatId)).result.current;

const mockMessage: Message = {
  id: 'MSG-1',
  revision: 1,
  chat: { id: chatId, type: 'Direct', revision: 1 },
  sender: {
    id: 'P-1',
    identity: { id: 'USR-1', name: 'Test User', revision: 1 },
    unreadMessageCount: 0,
    chat: { id: chatId, type: 'Direct', revision: 1 },
    muted: false,
    status: 'Active',
    lastReadMessage: { id: 'MSG-0', content: '', audit: undefined, isDeleted: false },
  },
  identity: { id: 'USR-1', name: 'Test User', revision: 1 },
  content: 'Test message content',
  visibility: 'Public',
  isDeleted: false,
  links: [],
  audit: {
    created: { at: '2026-03-17T10:00:00Z', by: 'USR-1' },
  },
};

const expectedUrlBase =
  `/v1/helpdesk/chats/${chatId}/messages` +
  `?select=audit,audit.created,links,sender,sender.identity,identity,content,visibility,isDeleted` +
  `&order=-audit.created.at`;

describe('useMessageApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMessages', () => {
    it('calls api.get with correct endpoint and default offset/limit', async () => {
      const api = setup();
      const mockResponse: PaginatedResponse<Message> = {
        $meta: {
          pagination: {
            offset: DEFAULT_OFFSET,
            limit: MESSAGE_PAGE_SIZE,
            total: 1,
          },
        },
        data: [mockMessage],
      };

      mockGet.mockResolvedValueOnce(mockResponse);

      let result;
      await act(async () => {
        result = await api.getMessages();
      });

      const expectedUrl =
        expectedUrlBase + `&offset=${DEFAULT_OFFSET}` + `&limit=${MESSAGE_PAGE_SIZE}`;

      expect(mockGet).toHaveBeenCalledWith(expectedUrl);
      expect(result).toEqual(mockResponse);
    });

    it('calls api.get with custom offset and limit', async () => {
      const api = setup();
      const mockResponse: PaginatedResponse<Message> = {
        $meta: {
          pagination: {
            offset: 20,
            limit: 10,
            total: 50,
          },
        },
        data: [mockMessage],
      };

      mockGet.mockResolvedValueOnce(mockResponse);

      let result;
      await act(async () => {
        result = await api.getMessages(20, 10);
      });

      const expectedUrl = expectedUrlBase + `&offset=20` + `&limit=10`;

      expect(mockGet).toHaveBeenCalledWith(expectedUrl);
      expect(result).toEqual(mockResponse);
    });

    it('returns response with empty data array when no messages found', async () => {
      const api = setup();
      const mockResponse: PaginatedResponse<Message> = {
        $meta: {
          pagination: {
            offset: 0,
            limit: MESSAGE_PAGE_SIZE,
            total: 0,
          },
        },
        data: [],
      };

      mockGet.mockResolvedValueOnce(mockResponse);

      let result: PaginatedResponse<Message> | undefined;
      await act(async () => {
        result = await api.getMessages();
      });

      expect(result).toEqual(mockResponse);
      expect(result!.data).toEqual([]);
    });

    it('returns response with multiple messages', async () => {
      const api = setup();
      const mockMessage2: Message = {
        ...mockMessage,
        id: 'MSG-2',
        content: 'Another message',
      };
      const mockResponse: PaginatedResponse<Message> = {
        $meta: {
          pagination: {
            offset: 0,
            limit: MESSAGE_PAGE_SIZE,
            total: 2,
          },
        },
        data: [mockMessage, mockMessage2],
      };

      mockGet.mockResolvedValueOnce(mockResponse);

      let result: PaginatedResponse<Message> | undefined;
      await act(async () => {
        result = await api.getMessages();
      });

      expect(result!.data).toHaveLength(2);
      expect(result!.data[0].id).toBe('MSG-1');
      expect(result!.data[1].id).toBe('MSG-2');
    });

    it('handles API errors', async () => {
      const api = setup();
      const mockError = new Error('API Error');

      mockGet.mockRejectedValueOnce(mockError);

      await expect(async () => {
        await act(async () => {
          await api.getMessages();
        });
      }).rejects.toThrow('API Error');
    });

    it('constructs endpoint with chatId in the path', async () => {
      const api = setup();
      const mockResponse: PaginatedResponse<Message> = {
        $meta: {
          pagination: {
            offset: 0,
            limit: MESSAGE_PAGE_SIZE,
            total: 1,
          },
        },
        data: [mockMessage],
      };

      mockGet.mockResolvedValueOnce(mockResponse);

      await act(async () => {
        await api.getMessages();
      });

      const calledUrl = mockGet.mock.calls[0][0];
      expect(calledUrl).toContain(`/v1/helpdesk/chats/${chatId}/messages`);
    });

    it('includes required select parameters in endpoint', async () => {
      const api = setup();
      const mockResponse: PaginatedResponse<Message> = {
        $meta: {
          pagination: {
            offset: 0,
            limit: MESSAGE_PAGE_SIZE,
            total: 1,
          },
        },
        data: [mockMessage],
      };

      mockGet.mockResolvedValueOnce(mockResponse);

      await act(async () => {
        await api.getMessages();
      });

      const calledUrl = mockGet.mock.calls[0][0];
      expect(calledUrl).toContain('select=audit');
      expect(calledUrl).toContain('sender');
      expect(calledUrl).toContain('identity');
    });

    it('orders messages by audit.created.at descending', async () => {
      const api = setup();
      const mockResponse: PaginatedResponse<Message> = {
        $meta: {
          pagination: {
            offset: 0,
            limit: MESSAGE_PAGE_SIZE,
            total: 1,
          },
        },
        data: [mockMessage],
      };

      mockGet.mockResolvedValueOnce(mockResponse);

      await act(async () => {
        await api.getMessages();
      });

      const calledUrl = mockGet.mock.calls[0][0];
      expect(calledUrl).toContain('order=-audit.created.at');
    });
  });

  describe('saveMessage', () => {
    it('calls api.post with correct endpoint and message data', async () => {
      const api = setup();
      const messageInput: MessageInput = {
        content: 'Test message',
        visibility: 'Public',
        isDeleted: false,
        links: [],
      };

      mockPost.mockResolvedValueOnce(mockMessage);

      let result;
      await act(async () => {
        result = await api.saveMessage(messageInput);
      });

      const expectedEndpoint = `/v1/helpdesk/chats/${chatId}/messages`;

      expect(mockPost).toHaveBeenCalledWith(expectedEndpoint, messageInput);
      expect(result).toEqual(mockMessage);
    });

    it('sends message with correct visibility', async () => {
      const api = setup();
      const messageInput: MessageInput = {
        content: 'Private message',
        visibility: 'Private',
        isDeleted: false,
        links: [],
      };

      const expectedMessage = { ...mockMessage, content: 'Private message', visibility: 'Private' };
      mockPost.mockResolvedValueOnce(expectedMessage);

      let result;
      await act(async () => {
        result = await api.saveMessage(messageInput);
      });

      expect(mockPost).toHaveBeenCalledWith(expect.any(String), messageInput);
      expect(result).toEqual(expectedMessage);
    });

    it('handles API errors when sending message', async () => {
      const api = setup();
      const messageInput: MessageInput = {
        content: 'Test message',
        visibility: 'Public',
        isDeleted: false,
        links: [],
      };
      const mockError = new Error('Failed to send message');

      mockPost.mockRejectedValueOnce(mockError);

      await expect(async () => {
        await act(async () => {
          await api.saveMessage(messageInput);
        });
      }).rejects.toThrow('Failed to send message');
    });

    it('includes links when provided', async () => {
      const api = setup();
      const messageInput: MessageInput = {
        content: 'Message with links',
        visibility: 'Public',
        isDeleted: false,
        links: [{ objectId: 'CASE-123', objectType: 'Case' }],
      };

      mockPost.mockResolvedValueOnce(mockMessage);

      await act(async () => {
        await api.saveMessage(messageInput);
      });

      expect(mockPost).toHaveBeenCalledWith(expect.any(String), messageInput);
    });
  });
});
