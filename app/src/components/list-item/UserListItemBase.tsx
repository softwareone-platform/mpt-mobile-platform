import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet } from 'react-native';

import AvatarIcon from '@/components/avatar/Avatar';
import Chip from '@/components/chip/Chip';
import { statusList } from '@/constants/status';
import { listItemStyle, linkStyle } from '@/styles';
import type { ListItemWithStatusProps } from '@/types/lists';
import { getStatus } from '@/utils/list';

const UserListItemBase = ({
  id,
  imagePath,
  title,
  subtitle,
  statusText,
  isFirst,
  isLast,
  leftElement,
  rightElement,
}: ListItemWithStatusProps) => {
  const { t } = useTranslation();

  const hasSubtitle = Boolean(subtitle);
  const status = getStatus(statusText, statusList);

  return (
    <View
      style={[
        styles.container,
        isFirst && styles.firstItemDynamic,
        isLast && styles.lastItemDynamic,
      ]}
    >
      <View
        style={[
          styles.contentWrapper,
          !hasSubtitle && styles.inlineContentWrapper,
          isLast && styles.lastItem,
        ]}
      >
        {leftElement && <View style={styles.leftElementWrapper}>{leftElement}</View>}
        <View style={styles.avatarWrapper}>
          <AvatarIcon id={id} imagePath={imagePath} size={44} />
        </View>

        <View style={styles.textContainer}>
          {hasSubtitle && (
            <Text style={[styles.title, styles.titleMain]} numberOfLines={1}>
              {title.trim()}
            </Text>
          )}

          <Text style={[styles.subtitle, !hasSubtitle && styles.title]} numberOfLines={1}>
            {hasSubtitle ? subtitle?.trim() : title.trim()}
          </Text>
        </View>

        <View style={styles.statusContainer}>
          {status && <Chip status={status} text={t(`status.${statusText}`)} />}
          {rightElement}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...listItemStyle.container,
    ...listItemStyle.listItemDynamic.container,
  },
  contentWrapper: {
    ...listItemStyle.contentWrapper,
    ...listItemStyle.textAndImage.contentWrapper,
    ...listItemStyle.listItemDynamic.contentWrapper,
  },
  inlineContentWrapper: listItemStyle.textInline.contentWrapper,
  avatarWrapper: listItemStyle.textAndImage.avatarWrapper,
  textContainer: {
    ...listItemStyle.textContainer,
    ...listItemStyle.textContainerGrow,
  },
  title: linkStyle.listItemLinkRegular,
  titleMain: listItemStyle.textAndStatus.title,
  subtitle: {
    ...listItemStyle.textAndImage.subtitle,
    ...listItemStyle.textAndStatus.subtitle,
  },
  statusContainer: listItemStyle.statusContainer,
  firstItemDynamic: listItemStyle.listItemDynamic.firstItem,
  lastItemDynamic: listItemStyle.listItemDynamic.lastItem,
  lastItem: listItemStyle.lastItem,
  leftElementWrapper: listItemStyle.leftElementWrapper,
});

export default UserListItemBase;
