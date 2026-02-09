import { useTranslation } from 'react-i18next';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

import AvatarIcon from '@/components/avatar/Avatar';
import Chip from '@/components/chip/Chip';
import { statusList } from '@/constants/status';
import { listItemStyle, linkStyle } from '@/styles';
import type { ListItemWithStatusProps } from '@/types/lists';
import { getStatus } from '@/utils/list';

const ListItemWithStatus = ({
  id,
  imagePath,
  title,
  subtitle,
  statusText,
  isFirst,
  isLast,
  onPress,
  testID,
}: ListItemWithStatusProps) => {
  const { t } = useTranslation();
  const hasSubtitle = Boolean(subtitle);
  const hasImage = Boolean(imagePath);

  const status = getStatus(statusText, statusList);

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
              {title.trim()}
            </Text>
          )}
          <View style={styles.statusRowContainer}>
            <Text style={[styles.subtitle, !hasSubtitle && styles.title]} numberOfLines={1}>
              {hasSubtitle ? subtitle?.trim() : title.trim()}
            </Text>

            {status && <Chip status={status} text={t(`status.${statusText}`)} />}
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

  avatarWrapper: listItemStyle.textAndImage.avatarWrapper,

  contentWrapper: {
    ...listItemStyle.contentWrapper,
    ...listItemStyle.textAndImage.contentWrapper,
    ...listItemStyle.listItemDynamic.contentWrapper,
  },

  inlineContentWrapper: listItemStyle.textInline.contentWrapper,

  textContainer: listItemStyle.textContainer,

  title: linkStyle.listItemLinkRegular,

  titleMain: listItemStyle.textAndStatus.title,

  subtitle: {
    ...listItemStyle.textAndImage.subtitle,
    ...listItemStyle.textAndStatus.subtitle,
  },

  statusRowContainer: listItemStyle.textInline.textContainerInline,

  firstItemDynamic: listItemStyle.listItemDynamic.firstItem,
  lastItemDynamic: listItemStyle.listItemDynamic.lastItem,
});

export default ListItemWithStatus;
