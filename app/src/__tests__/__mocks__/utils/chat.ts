import type { ChatParticipant, ChatItem } from '@/types/chat';

export const userId = 'USR-1';
export const otherUserId = 'USR-2';

export const participantUser: ChatParticipant = {
  id: 'P-1',
  identity: { id: userId, name: 'Me', revision: 1 },
  unreadMessageCount: 5,
};

export const participantOther: ChatParticipant = {
  id: 'P-2',
  identity: { id: otherUserId, name: 'Alice', revision: 1, icon: 'avatar.png' },
  account: { id: 'A-1', name: 'Acme Corp', type: 'Company', status: 'Active' },
  contact: { id: 'C-1', name: 'Alice Smith', email: 'alice@example.com', revision: 1 },
  unreadMessageCount: 2,
};

export const participantNoIcon = {
  id: 'P-99',
  identity: { id: 'USR-99', name: 'NoIcon', revision: 1 },
  unreadMessageCount: 0,
};

export const baseChat: ChatItem = {
  id: 'CHAT-1',
  name: 'Group Chat',
  type: 'Group',
  participants: [participantUser, participantOther],
  lastMessage: {
    id: 'MSG-1',
    content: 'Hello',
    audit: { created: { at: '2026-03-10T15:45:30Z' } },
  },
};

export const participants = [
  participantUser,
  participantOther,
  {
    ...participantOther,
    id: 'P-3',
    identity: { id: 'USR-3', name: 'Bob', revision: 1, icon: 'b.png' },
    unreadMessageCount: 0,
  },
  {
    ...participantOther,
    id: 'P-4',
    identity: { id: 'USR-4', name: 'Carol', revision: 1, icon: 'c.png' },
    unreadMessageCount: 0,
  },
  {
    ...participantOther,
    id: 'P-5',
    identity: { id: 'USR-5', name: 'Dan', revision: 1, icon: 'd.png' },
    unreadMessageCount: 0,
  },
];
