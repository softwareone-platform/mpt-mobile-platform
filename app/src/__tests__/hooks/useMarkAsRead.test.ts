import { QueryClient } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';

import { useMarkAsRead } from '@/hooks/useMarkAsRead';
import { logger } from '@/services/loggerService';
import type { ChatParticipant, Message } from '@/types/chat';

jest.mock('@/services/loggerService', () => ({ logger: { warn: jest.fn() } }));
jest.mock('@tanstack/react-query', () => ({ useQueryClient: jest.fn() }));

const mockInvalidateQueries = jest.fn();
const mockQueryClient = { invalidateQueries: mockInvalidateQueries } as unknown as QueryClient;

const chatId = 'CHT-123';
const mockParticipant: ChatParticipant = {
  id: 'CHP-456',
  identity: { id: 'USR-1', name: 'User', revision: 1 },
  status: 'Active',
  revision: 1,
  unreadMessageCount: 2,
};

const msg = (id: string, at: string): Message => ({
  id,
  revision: 1,
  identity: { id: 'USR-1', name: 'User', revision: 1 },
  content: 'Test',
  visibility: 'Public',
  isDeleted: false,
  links: [],
  audit: { created: { at, by: null } },
});

const messages = [
  msg('MSG-001', '2024-01-01T10:00:00Z'),
  msg('MSG-002', '2024-01-01T11:00:00Z'),
  msg('MSG-003', '2024-01-01T12:00:00Z'),
];

const viewToken = (m: Message) => ({ item: m, key: m.id, index: 0, isViewable: true });

describe('useMarkAsRead', () => {
  let mockSave: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockSave = jest.fn().mockResolvedValue({});
    (require('@tanstack/react-query').useQueryClient as jest.Mock).mockReturnValue(mockQueryClient);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('returns callbacks and config', () => {
    const { result } = renderHook(() =>
      useMarkAsRead({
        chatId,
        myParticipant: mockParticipant,
        messages,
        contentFillsScreen: true,
        saveParticipant: mockSave,
      }),
    );

    expect(typeof result.current.onViewableItemsChanged).toBe('function');
    expect(result.current.viewabilityConfig).toEqual({
      itemVisiblePercentThreshold: 50,
      minimumViewTime: 500,
    });
  });

  it('debounces and marks newest visible', async () => {
    const { result } = renderHook(() =>
      useMarkAsRead({
        chatId,
        myParticipant: mockParticipant,
        messages,
        contentFillsScreen: true,
        saveParticipant: mockSave,
      }),
    );

    result.current.onViewableItemsChanged({ viewableItems: [viewToken(messages[0])] });
    result.current.onViewableItemsChanged({ viewableItems: [viewToken(messages[2])] });

    jest.runAllTimers();
    await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(1));
    expect(mockSave).toHaveBeenCalledWith({ id: 'CHP-456', lastReadMessage: { id: 'MSG-003' } });
  });

  it('selects first when contentFillsScreen is true', async () => {
    const { result } = renderHook(() =>
      useMarkAsRead({
        chatId,
        myParticipant: mockParticipant,
        messages,
        contentFillsScreen: true,
        saveParticipant: mockSave,
      }),
    );

    result.current.onViewableItemsChanged({
      viewableItems: [viewToken(messages[0]), viewToken(messages[1])],
    });
    jest.runAllTimers();
    await waitFor(() => expect(mockSave).toHaveBeenCalled());
    expect(mockSave).toHaveBeenCalledWith({ id: 'CHP-456', lastReadMessage: { id: 'MSG-001' } });
  });

  it('selects last when contentFillsScreen is false', async () => {
    const { result } = renderHook(() =>
      useMarkAsRead({
        chatId,
        myParticipant: mockParticipant,
        messages,
        contentFillsScreen: false,
        saveParticipant: mockSave,
      }),
    );

    result.current.onViewableItemsChanged({
      viewableItems: [viewToken(messages[0]), viewToken(messages[1])],
    });
    jest.runAllTimers();
    await waitFor(() => expect(mockSave).toHaveBeenCalled());
    expect(mockSave).toHaveBeenCalledWith({ id: 'CHP-456', lastReadMessage: { id: 'MSG-002' } });
  });

  it('skips when participant or chatId undefined', () => {
    const { result: r1 } = renderHook(() =>
      useMarkAsRead({
        chatId,
        myParticipant: undefined,
        messages,
        contentFillsScreen: true,
        saveParticipant: mockSave,
      }),
    );
    r1.current.onViewableItemsChanged({ viewableItems: [viewToken(messages[0])] });
    jest.runAllTimers();

    const { result: r2 } = renderHook(() =>
      useMarkAsRead({
        chatId: undefined,
        myParticipant: mockParticipant,
        messages,
        contentFillsScreen: true,
        saveParticipant: mockSave,
      }),
    );
    r2.current.onViewableItemsChanged({ viewableItems: [viewToken(messages[0])] });
    jest.runAllTimers();

    expect(mockSave).not.toHaveBeenCalled();
  });

  it('skips duplicate and older messages', async () => {
    const { result } = renderHook(() =>
      useMarkAsRead({
        chatId,
        myParticipant: mockParticipant,
        messages,
        contentFillsScreen: true,
        saveParticipant: mockSave,
      }),
    );

    result.current.onViewableItemsChanged({ viewableItems: [viewToken(messages[0])] });
    jest.runAllTimers();
    await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(1));

    result.current.onViewableItemsChanged({ viewableItems: [viewToken(messages[0])] });
    jest.runAllTimers();
    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  it('skips marking older when lastReadMessage exists', () => {
    const { result } = renderHook(() =>
      useMarkAsRead({
        chatId,
        myParticipant: { ...mockParticipant, lastReadMessage: { id: 'MSG-002' } },
        messages,
        contentFillsScreen: true,
        saveParticipant: mockSave,
      }),
    );

    result.current.onViewableItemsChanged({ viewableItems: [viewToken(messages[0])] });
    jest.runAllTimers();
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('marks newer when lastReadMessage exists', async () => {
    const { result } = renderHook(() =>
      useMarkAsRead({
        chatId,
        myParticipant: { ...mockParticipant, lastReadMessage: { id: 'MSG-001' } },
        messages,
        contentFillsScreen: true,
        saveParticipant: mockSave,
      }),
    );

    result.current.onViewableItemsChanged({ viewableItems: [viewToken(messages[2])] });
    jest.runAllTimers();
    await waitFor(() => expect(mockSave).toHaveBeenCalled());
    expect(mockSave).toHaveBeenCalledWith({ id: 'CHP-456', lastReadMessage: { id: 'MSG-003' } });
  });

  it('invalidates queries and logs on error', async () => {
    mockSave.mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() =>
      useMarkAsRead({
        chatId,
        myParticipant: mockParticipant,
        messages,
        contentFillsScreen: true,
        saveParticipant: mockSave,
      }),
    );

    result.current.onViewableItemsChanged({ viewableItems: [viewToken(messages[0])] });
    jest.runAllTimers();
    await waitFor(() => expect(mockInvalidateQueries).toHaveBeenCalled());

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['chats'] });
    expect(logger.warn).toHaveBeenCalledWith(
      '[useMarkAsRead] Failed to mark message as read (non-critical)',
      expect.objectContaining({ messageId: 'MSG-001' }),
    );
  });

  it('allows retry after error', async () => {
    mockSave.mockRejectedValueOnce(new Error('Fail')).mockResolvedValueOnce({});

    const { result } = renderHook(() =>
      useMarkAsRead({
        chatId,
        myParticipant: mockParticipant,
        messages,
        contentFillsScreen: true,
        saveParticipant: mockSave,
      }),
    );

    result.current.onViewableItemsChanged({ viewableItems: [viewToken(messages[0])] });
    jest.runAllTimers();
    await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(1));

    result.current.onViewableItemsChanged({ viewableItems: [viewToken(messages[0])] });
    jest.runAllTimers();
    await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(2));
  });

  it('fires pending on unmount', async () => {
    const { result, unmount } = renderHook(() =>
      useMarkAsRead({
        chatId,
        myParticipant: mockParticipant,
        messages,
        contentFillsScreen: true,
        saveParticipant: mockSave,
      }),
    );

    result.current.onViewableItemsChanged({ viewableItems: [viewToken(messages[0])] });
    unmount();
    await waitFor(() => expect(mockSave).toHaveBeenCalled());
  });

  it('skips older message while a newer markAsRead is in flight (rapid scroll race condition)', async () => {
    let resolveFirst!: () => void;
    mockSave.mockImplementationOnce(() => new Promise((res) => { resolveFirst = () => res({}); }));

    const { result } = renderHook(() =>
      useMarkAsRead({
        chatId,
        myParticipant: mockParticipant,
        messages,
        contentFillsScreen: true,
        saveParticipant: mockSave,
        currentUserId: 'OTHER-USER',
      }),
    );

    // Mark MSG-003 (12:00) — API call stays pending
    result.current.onViewableItemsChanged({ viewableItems: [viewToken(messages[2])] });
    jest.runAllTimers();
    await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(1));

    // While pending, scroll back to MSG-001 (10:00) — should be blocked by lastReadCreatedAtRef
    result.current.onViewableItemsChanged({ viewableItems: [viewToken(messages[0])] });
    jest.runAllTimers();

    resolveFirst();
    await waitFor(() => Promise.resolve());

    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(mockSave).toHaveBeenCalledWith({ id: 'CHP-456', lastReadMessage: { id: 'MSG-003' } });
  });
});
