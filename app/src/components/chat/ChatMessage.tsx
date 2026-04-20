import { OutlinedIcons } from '@assets/icons';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet } from 'react-native';

import AvatarWithBadge from '@/components/avatar/AvatarWithBadge';
import ChatMessageContent from '@/components/chat/ChatMessageContent';
import ChatMessageLinkPreview from '@/components/chat/ChatMessageLinkPreview';
import OutlinedIcon from '@/components/common/OutlinedIcon';
import { chatMessageStyle } from '@/styles/components';
import type { Message, MessageType } from '@/types/chat';
import { formatDateForChat, getLocalTime } from '@/utils/formatting';

type ChatMessageProps = {
  message: Message;
  currentUserId: string;
  locale: string;
  isPrivate?: boolean;
};

const ChatMessage = ({ message, currentUserId, locale, isPrivate }: ChatMessageProps) => {
  const { t } = useTranslation();
  const isOwn = message.identity.id === currentUserId;
  const baseType: MessageType = isOwn ? 'own' : 'other';
  const contentType = isPrivate ? 'private' : baseType;
  const messageDate = formatDateForChat(message.audit?.created?.at, locale);
  const messageTime = getLocalTime(message.audit?.created?.at || '');

  const styles = useMemo(
    () =>
      StyleSheet.create({
        /* eslint-disable react-native/no-unused-styles */
        container: chatMessageStyle[baseType].container,
        messageWrapper: chatMessageStyle[baseType].messageWrapper,
        textContainer: chatMessageStyle[contentType].textContainer,
        text: chatMessageStyle[contentType].text,
        info: chatMessageStyle[baseType].info,
        infoText: chatMessageStyle.infoText,
        avatarWrapper: chatMessageStyle.avatarWrapper,
        privateIndicator: chatMessageStyle.privateIndicator,
        privateIndicatorText: chatMessageStyle.privateIndicatorText,
      }),
    [baseType, contentType],
  );

  const avatarId = message.identity.id;
  const avatarPath = message.identity.icon;
  const senderName = message.sender?.identity?.name ?? message.identity.name;

  return (
    <View style={styles.container}>
      {!isOwn && (
        <View style={styles.avatarWrapper}>
          <AvatarWithBadge
            userAvatarProps={{
              id: avatarId,
              imagePath: avatarPath,
            }}
            accountLogoProps={{
              id: message.sender?.account?.id ?? '',
              imagePath: message.sender?.account?.icon,
            }}
            variant="small"
          />
        </View>
      )}
      <View style={styles.messageWrapper}>
        <View style={styles.info}>
          {!isOwn && <Text style={styles.infoText}>{senderName}</Text>}
          {messageDate !== messageTime && <Text style={styles.infoText}>{messageDate}</Text>}
          <Text style={styles.infoText}>{messageTime}</Text>
        </View>
        {/* TODO: add sending indicator (message._optimistic) and failed state with retry (message._failed) */}
        <View style={styles.textContainer}>
          <ChatMessageContent
            content={message.content}
            color={chatMessageStyle[contentType].textColor}
            linkColor={chatMessageStyle[contentType].linkColor}
          />
          {message.links.map((link) => (
            <ChatMessageLinkPreview key={link.id} link={link} />
          ))}
          {isPrivate && (
            <View style={styles.privateIndicator}>
              <OutlinedIcon
                name={'lock' as keyof typeof OutlinedIcons}
                color={chatMessageStyle.privateIndicatorIconColor}
                size={chatMessageStyle.privateIndicatorIconSize}
              />
              <Text style={styles.privateIndicatorText}>{t('chat.privateMessageIndicator')}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default memo(ChatMessage);
