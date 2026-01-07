import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

import AvatarIcon from '@/components/avatar/Avatar';
import Chip from '@/components/chip/Chip';
import { listItemStyle, linkStyle } from '@/styles';
import type { ListItemWithStatusProps } from '@/types/lists';

const ListItemWithStatus = ({
  id,
  imagePath,
  title,
  subtitle,
  status,
  statusText,
  isLast,
  onPress,
  testID,
}: ListItemWithStatusProps) => {
  const hasSubtitle = Boolean(subtitle);
  const hasImage = Boolean(imagePath);

  return (
    <TouchableOpacity
      testID={testID}
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {hasImage && (
        <View style={styles.avatarWrapper}>
          <AvatarIcon id={id} imagePath={imagePath} size={44} />
        </View>
      )}

      <View
        style={[
          styles.contentWrapper,
          !hasSubtitle && styles.inlineContentWrapper,
          isLast && styles.lastItem,
        ]}
      >
        <View style={styles.textContainer}>
          {hasSubtitle && (
            <Text style={[styles.title, styles.titleMain]} numberOfLines={1} ellipsizeMode="tail">
              {title}
            </Text>
          )}
          <View style={styles.statusRowContainer}>
            <Text style={[styles.subtitle, !hasSubtitle && styles.title]} numberOfLines={1}>
              {hasSubtitle ? subtitle : title}
            </Text>

            {status && <Chip status={status} text={statusText} />}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    ...listItemStyle.container,
  },

  lastItem: listItemStyle.lastItem,

  avatarWrapper: listItemStyle.textAndImage.avatarWrapper,

  contentWrapper: {
    ...listItemStyle.contentWrapper,
    ...listItemStyle.textAndImage.contentWrapper,
  },

  inlineContentWrapper: listItemStyle.textInline.contentWrapper,

  textContainer: listItemStyle.textContainer,

  title: linkStyle.linkLarge,

  titleMain: listItemStyle.textAndStatus.title,

  subtitle: {
    ...listItemStyle.textAndImage.subtitle,
    ...listItemStyle.textAndStatus.subtitle,
  },

  statusRowContainer: listItemStyle.textInline.textContainerInline,
});

export default ListItemWithStatus;
