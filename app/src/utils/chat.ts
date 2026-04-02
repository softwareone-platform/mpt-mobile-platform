import { marked } from 'marked';

import { MIN_NUMBER_OF_CHAT_AVATARS, MAX_NUMBER_OF_CHAT_AVATARS, EMPTY_STRING } from '@/constants';
import type {
  ChatParticipant,
  AvatarItem,
  ChatItem,
  ChatType,
  ListItemChatProps,
} from '@/types/chat';
import { formatDateForChat } from '@/utils/formatting';

const ALLOWED_URI_SCHEMES = ['https:', 'http:'];

export const isSafeUri = (uri: string): boolean => {
  if (!uri?.trim()) return false;
  try {
    const { protocol } = new URL(uri);
    return ALLOWED_URI_SCHEMES.includes(protocol);
  } catch {
    return false;
  }
};

/**
 * Converts markdown/HTML content to a plain text string by running it
 * through the markdown parser and then stripping all HTML tags.
 * Intended for single-line preview contexts (e.g. chat list subtitles).
 */
export const stripMarkdown = (text: string): string => {
  const html = marked(text) as string;
  return html
    .replace(/<\/?(?:sub|sup)>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

export const getAvatarList = (
  participants: ChatParticipant[],
  type: ChatType,
  userId: string,
  minNumberOfAvatars: number = MIN_NUMBER_OF_CHAT_AVATARS,
  maxNumberOfAvatars: number = MAX_NUMBER_OF_CHAT_AVATARS,
): AvatarItem[] => {
  if (!participants?.length) return [];

  const avatars: AvatarItem[] = [];

  const numberOfAvatars = type === 'Group' ? maxNumberOfAvatars : minNumberOfAvatars;

  const sortedParticipants = [...participants].sort((a, b) => a.id.localeCompare(b.id));

  for (let i = 0; i < sortedParticipants.length && avatars.length < numberOfAvatars; i++) {
    const participant = sortedParticipants[i];

    if (participant.identity.id !== userId) {
      avatars.push({
        id: participant.identity?.id ?? participant.id,
        imagePath: participant.identity?.icon || EMPTY_STRING,
      });
    }
  }

  return avatars;
};

export const getUnreadCount = (participants: ChatParticipant[], userId: string): number => {
  if (!participants?.length) return 0;

  const participant = participants.find((p) => p.identity.id === userId);

  return participant?.unreadMessageCount ?? 0;
};

export const getCompanyName = (chat: ChatItem, currentUserId: string): string => {
  if (chat.type !== 'Direct' && chat.type !== 'Channel') {
    return EMPTY_STRING;
  }

  const otherParticipant = chat.participants?.find((p) => p.identity.id !== currentUserId);

  return otherParticipant?.account?.name ?? EMPTY_STRING;
};

export const getChatTitle = (chat: ChatItem, userId: string): string => {
  if (chat.type === 'Group') {
    if (chat.name) {
      return chat.name;
    }

    const otherParticipants = chat.participants?.filter((p) => p.identity.id !== userId) ?? [];
    if (otherParticipants.length > 0) {
      const participantName = otherParticipants[0]?.identity?.name ?? EMPTY_STRING;
      return `${participantName} + ${otherParticipants.length}`;
    }

    return EMPTY_STRING;
  }

  const otherParticipant = chat.participants?.find((p) => p.identity.id !== userId);
  return otherParticipant?.contact?.name ?? otherParticipant?.identity?.name ?? EMPTY_STRING;
};

export const getDirectChatParticipant = (
  participants: ChatParticipant[],
  userId: string,
): ChatParticipant | undefined => {
  return participants?.find((p) => p.identity.id !== userId);
};

export const getAvatarWithBadgeProps = (
  chatType: ChatType,
  participants: ChatParticipant[],
  userId: string,
) => {
  if (chatType !== 'Direct') {
    return undefined;
  }

  const participant = getDirectChatParticipant(participants, userId);

  const props = {
    userAvatarProps: {
      id: participant?.identity.id || '',
      imagePath: participant?.identity.icon || '',
    },
    accountLogoProps: {
      id: participant?.account?.id || '',
      imagePath: participant?.account?.icon || '',
    },
  };

  return props;
};

export const mapToChatListItemProps = (
  chat: ChatItem,
  locale: string,
  userId: string,
): ListItemChatProps => {
  const avatars = getAvatarList(chat.participants ?? [], chat.type, userId);
  const messageLatest = chat.lastMessage?.content ?? EMPTY_STRING;
  const dateOfLastMessage = formatDateForChat(chat.lastMessage?.audit?.created?.at, locale);
  const newMessageCounter = getUnreadCount(chat.participants ?? [], userId);
  const companyName = getCompanyName(chat, userId);
  const title = getChatTitle(chat, userId);
  const avatarWithBadge = getAvatarWithBadgeProps(chat.type, chat.participants ?? [], userId);

  return {
    id: chat.id,
    title,
    type: chat.type,
    companyName,
    avatarWithBadge,
    messageLatest,
    newMessageCounter,
    dateOfLastMessage,
    avatars,
    isVerified: false,
  };
};

export const parseMarkdownToHtml = (content: string): string => {
  const raw = marked(content) as string;
  return raw.replace(/<ul>([\s\S]*?)<\/ul>/g, (match, inner: string) => {
    if (!/<input[^>]*type="checkbox"/.test(inner)) return match;
    return inner
      .replace(/<li>\s*<input[^>]*checked[^>]*>([\s\S]*?)<\/li>/g, '<p>☑ $1</p>')
      .replace(/<li>\s*<input[^>]*type="checkbox"[^>]*>([\s\S]*?)<\/li>/g, '<p>☐ $1</p>');
  });
};

export const stripLinkMarkdown = (content: string, uris: string[]): string => {
  let result = content;
  for (const uri of uris) {
    const escapedUri = uri.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(`(?<!!)\\[([^\\]]*)\\]\\(${escapedUri}[^)]*\\)`, 'g'), '$1');
  }
  return result.trim();
};
