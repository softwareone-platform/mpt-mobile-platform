import { renderHook } from '@testing-library/react-native';

import { useMyParticipant } from '@/hooks/useMyParticipant';
import type { ChatItem, ChatParticipant } from '@/types/chat';

const userId = 'USR-123';
const otherUserId = 'USR-456';

const myParticipant: ChatParticipant = {
  id: 'P-1',
  identity: { id: userId, name: 'Current User', revision: 1 },
  unreadMessageCount: 3,
  lastReadMessage: { id: 'MSG-100' },
  status: 'Active',
  revision: 1,
};

const otherParticipant: ChatParticipant = {
  id: 'P-2',
  identity: { id: otherUserId, name: 'Other User', revision: 1 },
  unreadMessageCount: 0,
  status: 'Active',
  revision: 1,
};

const exitedParticipant: ChatParticipant = {
  id: 'P-3',
  identity: { id: userId, name: 'Current User', revision: 1 },
  unreadMessageCount: 0,
  status: 'Exited',
  revision: 1,
};

const mockChat: ChatItem = {
  id: 'CHAT-1',
  name: 'Test Chat',
  type: 'Group',
  participants: [myParticipant, otherParticipant],
};

describe('useMyParticipant', () => {
  it('returns current users participant record when found', () => {
    const { result } = renderHook(() => useMyParticipant(mockChat, userId));

    expect(result.current).toEqual(myParticipant);
    expect(result.current?.id).toBe('P-1');
    expect(result.current?.identity.id).toBe(userId);
  });

  it('returns undefined when chat is undefined', () => {
    const { result } = renderHook(() => useMyParticipant(undefined, userId));

    expect(result.current).toBeUndefined();
  });

  it('returns undefined when currentUserId is empty', () => {
    const { result } = renderHook(() => useMyParticipant(mockChat, ''));

    expect(result.current).toBeUndefined();
  });

  it('returns undefined when chat has no participants', () => {
    const chatWithoutParticipants: ChatItem = {
      ...mockChat,
      participants: undefined,
    };

    const { result } = renderHook(() => useMyParticipant(chatWithoutParticipants, userId));

    expect(result.current).toBeUndefined();
  });

  it('returns undefined when user is not in participants list', () => {
    const chatWithoutUser: ChatItem = {
      ...mockChat,
      participants: [otherParticipant],
    };

    const { result } = renderHook(() => useMyParticipant(chatWithoutUser, userId));

    expect(result.current).toBeUndefined();
  });

  it('does not return participant with Exited status', () => {
    const chatWithExitedUser: ChatItem = {
      ...mockChat,
      participants: [exitedParticipant, otherParticipant],
    };

    const { result } = renderHook(() => useMyParticipant(chatWithExitedUser, userId));

    expect(result.current).toBeUndefined();
  });

  it('returns active participant even when exited participant exists for same user', () => {
    const chatWithBothStatuses: ChatItem = {
      ...mockChat,
      participants: [myParticipant, exitedParticipant, otherParticipant],
    };

    const { result } = renderHook(() => useMyParticipant(chatWithBothStatuses, userId));

    expect(result.current).toEqual(myParticipant);
    expect(result.current?.status).toBe('Active');
  });

  it('memoizes result when inputs do not change', () => {
    const { result } = renderHook(() => useMyParticipant(mockChat, userId));

    const firstResult = result.current;
    const secondResult = result.current;

    expect(firstResult).toBe(secondResult);
  });

  it('updates result when chat changes', () => {
    const { result, rerender } = renderHook(({ chat, id }) => useMyParticipant(chat, id), {
      initialProps: { chat: mockChat, id: userId },
    });

    expect(result.current?.id).toBe('P-1');

    const updatedParticipant: ChatParticipant = {
      ...myParticipant,
      id: 'P-99',
    };
    const updatedChat: ChatItem = {
      ...mockChat,
      participants: [updatedParticipant, otherParticipant],
    };

    rerender({ chat: updatedChat, id: userId });

    expect(result.current?.id).toBe('P-99');
  });

  it('updates result when currentUserId changes', () => {
    const { result, rerender } = renderHook(({ chat, id }) => useMyParticipant(chat, id), {
      initialProps: { chat: mockChat, id: userId },
    });

    expect(result.current?.identity.id).toBe(userId);

    rerender({ chat: mockChat, id: otherUserId });

    expect(result.current?.identity.id).toBe(otherUserId);
  });
});
