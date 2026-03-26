import { renderHook, waitFor } from '@testing-library/react-native';

jest.mock('@/services/loggerService', () => ({
  logger: { error: jest.fn() },
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: jest.fn(),
}));

const mockAddOptimisticMessage = jest.fn();
const mockReplaceOptimisticMessage = jest.fn();
const mockMarkMessageFailed = jest.fn();
const mockSaveMessage = jest.fn();
const mockInvalidateQueries = jest.fn();

jest.mock('@/context/AccountContext', () => ({
  useAccount: () => ({
    userData: {
      id: 'USR-1',
      name: 'Test User',
      icon: 'avatar.png',
      currentAccount: { id: 'ACC-1' },
    },
  }),
}));

jest.mock('@/context/MessagesContext', () => ({
  useMessages: () => ({
    addOptimisticMessage: mockAddOptimisticMessage,
    replaceOptimisticMessage: mockReplaceOptimisticMessage,
    markMessageFailed: mockMarkMessageFailed,
  }),
}));

jest.mock('@/services/messageService', () => ({
  useMessageApi: () => ({ saveMessage: mockSaveMessage }),
}));

import { useSendMessage } from '@/hooks/useSendMessage';
import type { Message } from '@/types/chat';

const chatId = 'CHT-123';
const inputText = 'Hello world';
const setInputText = jest.fn();
const onBeforeSend = jest.fn();

const mockResponse: Message = {
  id: 'MSG-999',
  revision: 1,
  identity: { id: 'USR-1', name: 'Test User', revision: 1 },
  content: inputText,
  visibility: 'Public',
  isDeleted: false,
  links: [],
  audit: { created: { at: '2026-01-01T10:00:00Z', by: null } },
};

const setup = (overrides?: { chatId?: string | undefined; inputText?: string }) =>
  renderHook(() =>
    useSendMessage({
      chatId: overrides && 'chatId' in overrides ? overrides.chatId : chatId,
      inputText: overrides?.inputText ?? inputText,
      setInputText,
      onBeforeSend,
    }),
  );

describe('useSendMessage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSaveMessage.mockResolvedValue(mockResponse);
    (require('@tanstack/react-query').useQueryClient as jest.Mock).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    });
  });

  it('returns a send function', () => {
    const { result } = setup();
    expect(typeof result.current).toBe('function');
  });

  it('sends message and updates state on success', async () => {
    const { result } = setup();

    await result.current();

    expect(onBeforeSend).toHaveBeenCalled();
    expect(mockAddOptimisticMessage).toHaveBeenCalledWith(
      expect.objectContaining({ content: inputText, visibility: 'Public', _optimistic: true }),
    );
    expect(setInputText).toHaveBeenCalledWith('');
    expect(mockSaveMessage).toHaveBeenCalledWith({
      content: inputText,
      visibility: 'Public',
      isDeleted: false,
      links: [],
    });
    expect(mockReplaceOptimisticMessage).toHaveBeenCalledWith(expect.any(String), mockResponse);
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['chats', 'USR-1', 'ACC-1'],
    });
  });

  it('marks message failed and restores input on error', async () => {
    mockSaveMessage.mockRejectedValueOnce(new Error('Network error'));
    const { result } = setup();

    await result.current();

    expect(mockMarkMessageFailed).toHaveBeenCalledWith(expect.any(String));
    expect(setInputText).toHaveBeenCalledWith(inputText);
  });

  it('skips send when input is blank', async () => {
    const { result } = setup({ inputText: '   ' });

    await result.current();

    expect(mockSaveMessage).not.toHaveBeenCalled();
    expect(mockAddOptimisticMessage).not.toHaveBeenCalled();
  });

  it('skips send when chatId is undefined', async () => {
    const { result } = setup({ chatId: undefined });

    await result.current();

    expect(mockSaveMessage).not.toHaveBeenCalled();
  });

  it('prevents double-send while a request is in flight', async () => {
    let resolve!: (value: Message) => void;
    mockSaveMessage.mockImplementationOnce(
      () =>
        new Promise((r) => {
          resolve = r;
        }),
    );
    const { result } = setup();

    const first = result.current();
    await result.current(); // blocked — isSendingRef is true

    resolve(mockResponse);
    await first;

    await waitFor(() => expect(mockSaveMessage).toHaveBeenCalledTimes(1));
  });
});
