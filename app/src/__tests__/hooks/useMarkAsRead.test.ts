import { QueryClient } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';

import { useMarkAsRead } from '@/hooks/useMarkAsRead';
import type { UseMarkAsReadParams } from '@/hooks/useMarkAsRead';
import { logger } from '@/services/loggerService';
import type { ChatParticipant, Message } from '@/types/chat';

jest.mock('@/services/loggerService', () => ({ logger: { warn: jest.fn() } }));
jest.mock('@tanstack/react-query', () => ({ useQueryClient: jest.fn() }));

const mockInvalidateQueries = jest.fn();
const mockQueryClient = { invalidateQueries: mockInvalidateQueries } as unknown as QueryClient;

const chatId = 'CHT-123';
const currentUserId = 'OTHER-USR';

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

  const setup = (overrides?: Partial<UseMarkAsReadParams>) =>
    renderHook(() =>
      useMarkAsRead({
        chatId,
        myParticipant: mockParticipant,
        messages,
        contentFillsScreen: true,
        saveParticipant: mockSave,
        currentUserId,
        ...overrides,
      }),
    );

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
    const { result } = setup();

    expect(typeof result.current.onViewableItemsChanged).toBe('function');
    expect(result.current.viewabilityConfig).toEqual({
      itemVisiblePercentThreshold: 50,
      minimumViewTime: 500,
    });
  });

  it('debounces and marks newest visible', async () => {
    const { result } = setup();

    result.current.onViewableItemsChanged({ viewableItems: [viewToken(messages[0])] });
    result.current.onViewableItemsChanged({ viewableItems: [viewToken(messages[2])] });

    jest.runAllTimers();
    await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(1));
    expect(mockSave).toHaveBeenCalledWith({ id: 'CHP-456', lastReadMessage: { id: 'MSG-003' } });
  });

  it('selects first viewable item as newest when contentFillsScreen (inverted list)', async () => {
    const { result } = setup();

    result.current.onViewableItemsChanged({
      viewableItems: [viewToken(messages[0]), viewToken(messages[1])],
    });
    jest.runAllTimers();
    await waitFor(() => expect(mockSave).toHaveBeenCalled());
    expect(mockSave).toHaveBeenCalledWith({ id: 'CHP-456', lastReadMessage: { id: 'MSG-001' } });
  });

  it('selects last viewable item as newest when not contentFillsScreen (non-inverted list)', async () => {
    const { result } = setup({ contentFillsScreen: false });

    result.current.onViewableItemsChanged({
      viewableItems: [viewToken(messages[0]), viewToken(messages[1])],
    });
    jest.runAllTimers();
    await waitFor(() => expect(mockSave).toHaveBeenCalled());
    expect(mockSave).toHaveBeenCalledWith({ id: 'CHP-456', lastReadMessage: { id: 'MSG-002' } });
  });

  it('skips when participant or chatId is undefined', () => {
    const { result: r1 } = setup({ myParticipant: undefined });
    r1.current.onViewableItemsChanged({ viewableItems: [viewToken(messages[0])] });
    jest.runAllTimers();

    const { result: r2 } = setup({ chatId: undefined });
    r2.current.onViewableItemsChanged({ viewableItems: [viewToken(messages[0])] });
    jest.runAllTimers();

    expect(mockSave).not.toHaveBeenCalled();
  });

  it('skips own messages', () => {
    const ownMessage = { ...messages[0], identity: { ...messages[0].identity, id: currentUserId } };
    const { result } = setup();

    result.current.onViewableItemsChanged({ viewableItems: [viewToken(ownMessage)] });
    jest.runAllTimers();

    expect(mockSave).not.toHaveBeenCalled();
  });

  it('skips optimistic messages', () => {
    const optimistic: Message = { ...messages[0], _optimistic: true };
    const { result } = setup();

    result.current.onViewableItemsChanged({ viewableItems: [viewToken(optimistic)] });
    jest.runAllTimers();

    expect(mockSave).not.toHaveBeenCalled();
  });

  it('skips same message seen twice', async () => {
    const { result } = setup();

    result.current.onViewableItemsChanged({ viewableItems: [viewToken(messages[0])] });
    jest.runAllTimers();
    await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(1));

    result.current.onViewableItemsChanged({ viewableItems: [viewToken(messages[0])] });
    jest.runAllTimers();
    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  it('skips marking older when lastReadMessage exists on participant', () => {
    const { result } = setup({
      myParticipant: { ...mockParticipant, lastReadMessage: { id: 'MSG-002' } },
    });

    result.current.onViewableItemsChanged({ viewableItems: [viewToken(messages[0])] });
    jest.runAllTimers();
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('marks newer when lastReadMessage exists on participant', async () => {
    const { result } = setup({
      myParticipant: { ...mockParticipant, lastReadMessage: { id: 'MSG-001' } },
    });

    result.current.onViewableItemsChanged({ viewableItems: [viewToken(messages[2])] });
    jest.runAllTimers();
    await waitFor(() => expect(mockSave).toHaveBeenCalled());
    expect(mockSave).toHaveBeenCalledWith({ id: 'CHP-456', lastReadMessage: { id: 'MSG-003' } });
  });

  it('invalidates queries and logs on error', async () => {
    mockSave.mockRejectedValueOnce(new Error('API Error'));
    const { result } = setup();

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
    const { result } = setup();

    result.current.onViewableItemsChanged({ viewableItems: [viewToken(messages[0])] });
    jest.runAllTimers();
    await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(1));

    result.current.onViewableItemsChanged({ viewableItems: [viewToken(messages[0])] });
    jest.runAllTimers();
    await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(2));
  });

  it('fires pending message on unmount', async () => {
    const { result, unmount } = setup();

    result.current.onViewableItemsChanged({ viewableItems: [viewToken(messages[0])] });
    unmount();
    await waitFor(() => expect(mockSave).toHaveBeenCalled());
  });

  it('skips older message while a newer markAsRead is in flight (rapid scroll race condition)', async () => {
    let resolveFirst!: () => void;
    mockSave.mockImplementationOnce(
      () =>
        new Promise((res) => {
          resolveFirst = () => res({});
        }),
    );

    const { result } = setup();

    // Mark MSG-003 (12:00) — API call stays pending
    result.current.onViewableItemsChanged({ viewableItems: [viewToken(messages[2])] });
    jest.runAllTimers();
    await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(1));

    // While pending, scroll back to MSG-001 (10:00) — blocked by lastReadCreatedAtRef
    result.current.onViewableItemsChanged({ viewableItems: [viewToken(messages[0])] });
    jest.runAllTimers();

    resolveFirst();
    await waitFor(() => Promise.resolve());

    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(mockSave).toHaveBeenCalledWith({ id: 'CHP-456', lastReadMessage: { id: 'MSG-003' } });
  });
});
