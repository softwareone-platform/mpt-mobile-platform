import { MIN_NUMBER_OF_CHAT_AVATARS, MAX_NUMBER_OF_CHAT_AVATARS, EMPTY_STRING } from '@/constants';
import { ChatParticipant, AvatarItem, ChatItem, ChatType, ListItemChatProps } from '@/types/chat';
import { formatDateForChat } from '@/utils/formatting';

export const getAvatarList = (
  participants: ChatParticipant[],
  type: ChatType,
  userId: string,
  minNumberOfAvatars: number,
  maxNumberOfAvatars: number,
): AvatarItem[] => {
  if (!participants?.length) return [];

  const avatars: AvatarItem[] = [];

  const numberOfAvatars = type === 'Group' ? maxNumberOfAvatars : minNumberOfAvatars;

  for (let i = 0; i < participants.length && avatars.length < numberOfAvatars; i++) {
    const participant = participants[i];

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
    return chat.name ?? EMPTY_STRING;
  }

  const otherParticipant = chat.participants?.find((p) => p.identity.id !== userId);

  return otherParticipant?.contact?.name ?? EMPTY_STRING;
};

export const mapToChatListItemProps = (
  chat: ChatItem,
  locale: string,
  userId: string,
): ListItemChatProps => {
  const avatars = getAvatarList(
    chat.participants,
    chat.type,
    userId,
    MIN_NUMBER_OF_CHAT_AVATARS,
    MAX_NUMBER_OF_CHAT_AVATARS,
  );
  const messageLatest = chat.lastMessage?.content ?? EMPTY_STRING;
  const dateOfLastMessage = formatDateForChat(chat.lastMessage?.audit?.created?.at, locale);
  const newMessageCounter = getUnreadCount(chat.participants, userId);
  const companyName = getCompanyName(chat, userId);
  const title = getChatTitle(chat, userId);

  return {
    id: chat.id,
    title,
    companyName,
    messageLatest,
    newMessageCounter,
    dateOfLastMessage,
    avatars,
    isVerified: false,
  };
};
