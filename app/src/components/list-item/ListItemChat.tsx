import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

import AvatarWithBadge from '@/components/avatar/AvatarWithBadge';
import GroupAvatar from '@/components/avatar/GroupAvatar';
import { listItemStyle, listItemChatStyle, linkStyle, Color } from '@/styles';
import type { ListItemChatProps } from '@/types/chat';
import { stripMarkdown } from '@/utils/chat';

const ListItemChat = ({
  id,
  type,
  title,
  companyName,
  avatarWithBadge,
  messageLatest,
  newMessageCounter,
  dateOfLastMessage,
  isVerified,
  avatars,
  isFirst,
  isLast,
  onPress,
  testID,
}: ListItemChatProps) => {
  const { t } = useTranslation();
  const hasMessage = Boolean(messageLatest);

  return (
    <TouchableOpacity
      testID={testID}
      style={[
        styles.container,
        isFirst && styles.firstItemDynamic,
        isLast && styles.lastItemDynamic,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.contentWrapper, isLast && styles.lastItem]}>
        {type === 'Direct' ? (
          <AvatarWithBadge
            userAvatarProps={{
              id: avatarWithBadge?.userAvatarProps.id || '',
              imagePath: avatarWithBadge?.userAvatarProps.imagePath || '',
            }}
            accountLogoProps={{
              id: avatarWithBadge?.accountLogoProps.id || '',
              imagePath: avatarWithBadge?.accountLogoProps.imagePath || '',
            }}
            variant="medium"
          />
        ) : (
          <GroupAvatar avatars={avatars || []} />
        )}
        <View style={styles.textContainer}>
          <View style={styles.textColumn}>
            <View style={styles.topRow}>
              <View style={styles.titleWrapper}>
                <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                  {title.trim()}
                </Text>
              </View>
              {companyName !== '' && (
                <View style={styles.companyRow}>
                  <Text style={styles.separator}>|</Text>
                  <Text style={styles.companyText} numberOfLines={1} ellipsizeMode="tail">
                    {companyName?.trim()}
                  </Text>
                  {isVerified && (
                    <View style={styles.iconWrapper}>
                      <MaterialIcons name="verified" size={12} color={Color.brand.success} />
                    </View>
                  )}
                </View>
              )}
            </View>
            <Text style={styles.subtitle} numberOfLines={1}>
              {hasMessage ? stripMarkdown(messageLatest ?? '') : t('common.message.noMessages')}
            </Text>
          </View>
          <View style={styles.statusColumn}>
            <Text style={styles.dateText}>{dateOfLastMessage}</Text>
            {newMessageCounter > 0 && (
              <Text style={styles.messageCounter}>{newMessageCounter}</Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    ...listItemStyle.container,
    ...listItemStyle.listItemDynamic.container,
  },
  lastItem: listItemStyle.lastItem,
  firstItemDynamic: listItemStyle.listItemDynamic.firstItem,
  lastItemDynamic: listItemStyle.listItemDynamic.lastItem,
  contentWrapper: listItemChatStyle.contentWrapper,
  textContainer: listItemChatStyle.textContainer,
  textColumn: listItemChatStyle.textColumn,
  titleWrapper: listItemChatStyle.titleWrapper,
  title: linkStyle.listItemLinkRegular,
  subtitle: listItemChatStyle.subtitle,
  topRow: listItemChatStyle.topRow,
  separator: listItemChatStyle.separator,
  companyRow: listItemChatStyle.companyRow,
  companyText: listItemChatStyle.companyText,
  iconWrapper: listItemChatStyle.iconWrapper,
  statusColumn: listItemChatStyle.statusColumn,
  messageCounter: listItemChatStyle.messageCounter,
  dateText: listItemChatStyle.dateText,
});

export default ListItemChat;
