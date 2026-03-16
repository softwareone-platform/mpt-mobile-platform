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

  it('returns empty array if participants is undefined', () => {
    expect(getAvatarList(undefined as any, 'Group', userId, 1, 5)).toEqual([]);
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

  it('returns empty array when only current user is in participants', () => {
    const avatars = getAvatarList([participantUser], 'Direct', userId, 1, 5);
    expect(avatars).toEqual([]);
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

  it('returns 0 if participants is empty', () => {
    const count = getUnreadCount([], userId);
    expect(count).toBe(0);
  });

  it('returns 0 if participants is undefined', () => {
    const count = getUnreadCount(undefined as any, userId);
    expect(count).toBe(0);
  });

  it('returns 0 if participant unreadMessageCount is undefined', () => {
    const participantWithoutCount = {
      ...participantUser,
      unreadMessageCount: undefined as any,
    };
    const count = getUnreadCount([participantWithoutCount], userId);
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

  it('returns EMPTY_STRING if other participant has no account', () => {
    const participantNoAccount = { ...participantOther, account: undefined };
    const chat: ChatItem = {
      ...baseChat,
      participants: [participantUser, participantNoAccount],
      type: 'Direct',
    };
    expect(getCompanyName(chat, userId)).toBe('');
  });

  it('returns EMPTY_STRING if participants is undefined', () => {
    const chat: ChatItem = { ...baseChat, participants: undefined, type: 'Direct' };
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

  it('returns EMPTY_STRING if Group chat has no name', () => {
    const chat: ChatItem = { ...baseChat, type: 'Group', name: undefined };
    expect(getChatTitle(chat, userId)).toBe('');
  });

  it('returns EMPTY_STRING if participants is undefined for Direct chat', () => {
    const chat: ChatItem = { ...baseChat, type: 'Direct', participants: undefined };
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

  it('handles chat with no lastMessage', () => {
    const chatWithoutMessage: ChatItem = { ...baseChat, lastMessage: undefined };
    const props: ListItemChatProps = mapToChatListItemProps(chatWithoutMessage, 'en-US', userId);
    expect(props.messageLatest).toBe('');
    expect(props.dateOfLastMessage).toBeDefined();
  });

  it('handles chat with no participants', () => {
    const chatWithoutParticipants: ChatItem = { ...baseChat, participants: undefined };
    const props: ListItemChatProps = mapToChatListItemProps(
      chatWithoutParticipants,
      'en-US',
      userId,
    );
    expect(props.avatars).toEqual([]);
    expect(props.newMessageCounter).toBe(0);
  });

  it('handles Direct chat correctly', () => {
    const directChat: ChatItem = { ...baseChat, type: 'Direct' };
    const props: ListItemChatProps = mapToChatListItemProps(directChat, 'en-US', userId);
    expect(props.title).toBe('Alice Smith');
    expect(props.companyName).toBe('Acme Corp');
  });

  it('handles Channel chat correctly', () => {
    const channelChat: ChatItem = { ...baseChat, type: 'Channel', name: 'Channel Name' };
    const props: ListItemChatProps = mapToChatListItemProps(channelChat, 'en-US', userId);
    expect(props.companyName).toBe('Acme Corp');
  });
});
