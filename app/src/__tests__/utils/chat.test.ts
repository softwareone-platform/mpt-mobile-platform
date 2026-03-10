import {
  userId,
  participantUser,
  participantOther,
  participantNoIcon,
  otherUserId,
  participants,
  baseChat,
} from '../__mocks__/utils/chat';

import type { ChatItem, ListItemChatProps } from '@/types/chat';
import {
  getAvatarList,
  getUnreadCount,
  getCompanyName,
  getChatTitle,
  mapToChatListItemProps,
} from '@/utils/chat';

describe('getAvatarList', () => {
  it('returns empty array if participants is empty', () => {
    expect(getAvatarList([], 'Group', userId, 1, 5)).toEqual([]);
  });

  it('returns minNumberOfAvatars for Direct chat excluding current user', () => {
    const avatars = getAvatarList([participantUser, participantOther], 'Direct', userId, 1, 5);
    expect(avatars).toEqual([{ id: otherUserId, imagePath: 'avatar.png' }]);
  });

  it('returns maxNumberOfAvatars for Group chat excluding current user', () => {
    const avatars = getAvatarList(participants, 'Group', userId, 1, 3);
    expect(avatars.length).toBe(3);
    expect(avatars.map((a) => a.id)).not.toContain(userId);
  });

  it('returns all available participants if maxNumberOfAvatars > number of participants', () => {
    const avatars = getAvatarList([participantUser, participantOther], 'Group', userId, 1, 5);
    expect(avatars.length).toBe(1);
    expect(avatars[0].id).toBe(otherUserId);
  });

  it('handles participants without identity icon', () => {
    const avatars = getAvatarList([participantUser, participantNoIcon], 'Direct', userId, 1, 5);
    expect(avatars[0].imagePath).toBe('');
  });

  it('does not include current user in avatars', () => {
    const participants = [
      participantUser,
      participantOther,
      { id: 'P-3', identity: { id: userId, name: 'Me Again', revision: 2 }, unreadMessageCount: 0 },
    ];
    const avatars = getAvatarList(participants, 'Group', userId, 1, 5);
    avatars.forEach((a) => expect(a.id).not.toBe(userId));
  });
});

describe('getUnreadCount', () => {
  it('returns unreadMessageCount for current user', () => {
    const count = getUnreadCount([participantUser, participantOther], userId);
    expect(count).toBe(5);
  });

  it('returns 0 if current user is not in participants', () => {
    const count = getUnreadCount([participantOther], userId);
    expect(count).toBe(0);
  });
});

describe('getCompanyName', () => {
  it('returns account.name of other participant for Direct chat', () => {
    const name = getCompanyName({ ...baseChat, type: 'Direct' }, userId);
    expect(name).toBe('Acme Corp');
  });

  it('returns account.name of other participant for Channel chat', () => {
    const name = getCompanyName({ ...baseChat, type: 'Channel' }, userId);
    expect(name).toBe('Acme Corp');
  });

  it('returns empty string for Group or Case chat', () => {
    expect(getCompanyName({ ...baseChat, type: 'Group' }, userId)).toBe('');
    expect(getCompanyName({ ...baseChat, type: 'Case' }, userId)).toBe('');
  });

  it('returns EMPTY_STRING if no other participant', () => {
    const chat: ChatItem = { ...baseChat, participants: [participantUser], type: 'Direct' };
    expect(getCompanyName(chat, userId)).toBe('');
  });
});

describe('getChatTitle', () => {
  it('returns chat.name for Group chat', () => {
    const title = getChatTitle({ ...baseChat, type: 'Group' }, userId);
    expect(title).toBe('Group Chat');
  });

  it('returns other participant contact.name for Direct chat', () => {
    const title = getChatTitle({ ...baseChat, type: 'Direct' }, userId);
    expect(title).toBe('Alice Smith');
  });

  it('returns EMPTY_STRING if other participant has no contact', () => {
    const chat: ChatItem = { ...baseChat, type: 'Direct', participants: [participantUser] };
    expect(getChatTitle(chat, userId)).toBe('');
  });
});

describe('mapToChatListItemProps', () => {
  it('returns correct ListItemChatProps object', () => {
    const props: ListItemChatProps = mapToChatListItemProps(baseChat, 'en-US', userId);
    expect(props.id).toBe(baseChat.id);
    expect(props.title).toBe('Group Chat');
    expect(props.companyName).toBe('');
    expect(props.messageLatest).toBe('Hello');
    expect(props.newMessageCounter).toBe(5);
    expect(props.dateOfLastMessage).toBeDefined();
    expect(props.avatars.length).toBeGreaterThan(0);
    expect(props.isVerified).toBe(false);
  });
});
