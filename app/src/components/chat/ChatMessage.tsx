import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import OutlinedIcon from '../common/OutlinedIcon';

import Avatar from '@/components/avatar/Avatar';
import { chatMessageStyle } from '@/styles/components';
import { Color } from '@/styles/tokens';
import type { Message, MessageType } from '@/types/chat';
import { formatDateForChat, getTime } from '@/utils/formatting';

type Props = {
  message: Message;
  currentUserId: string;
  locale: string;
};

const ChatMessage = ({ message, currentUserId, locale }: Props) => {
  const isOwn = message.identity.id === currentUserId;
  const type: MessageType = isOwn ? 'own' : 'other';
  const messageDate = formatDateForChat(message.audit?.created?.at, locale);
  const messageTime = getTime(message.audit?.created?.at || '');

  const styles = useMemo(
    () =>
      StyleSheet.create({
        /* eslint-disable react-native/no-unused-styles */
        container: chatMessageStyle[type].container,
        messageWrapper: chatMessageStyle.messageWrapper,
        textContainer: chatMessageStyle[type].textContainer,
        text: chatMessageStyle[type].text,
        info: chatMessageStyle[type].info,
        infoText: chatMessageStyle.infoText,
        avatarWrapper: chatMessageStyle.avatarWrapper,
      }),
    [type],
  );

  const avatarId = message.identity.id;
  const avatarPath = message.identity.icon;
  const senderName = message.sender?.identity?.name || message.identity.name;

  return (
    <View style={styles.container}>
      {!isOwn && (
        <View style={styles.avatarWrapper}>
          <Avatar id={avatarId} imagePath={avatarPath} variant="small" />
        </View>
      )}
      <View style={styles.messageWrapper}>
        <View style={styles.info}>
          {!isOwn && <Text style={styles.infoText}>{senderName}</Text>}
          {messageDate !== messageTime && <Text style={styles.infoText}>{messageDate}</Text>}
          <Text style={styles.infoText}>{messageTime}</Text>
          <Text>
            {isOwn && <OutlinedIcon name="more-horiz" size={16} color={Color.brand.type} />}
          </Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.text}>{message.content}</Text>
        </View>
      </View>
    </View>
  );
};

export default ChatMessage;
