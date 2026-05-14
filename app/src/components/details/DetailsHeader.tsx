import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet } from 'react-native';

import AvatarIcon from '@/components/avatar/Avatar';
import GroupAvatar from '@/components/avatar/GroupAvatar';
import Chip from '@/components/chip/Chip';
import { statusList } from '@/constants/status';
import { listItemStyle } from '@/styles';
import type { ListItemWithStatusProps } from '@/types/lists';
import { getStatus } from '@/utils/list';
import { TestIDs } from '@/utils/testID';

type DetailsHeaderProps = ListItemWithStatusProps & {
  customAvatar?: React.ReactNode;
};

const DetailsHeader = ({
  id,
  imagePath,
  title,
  subtitle,
  statusText,
  variant = 'default',
  headerTitleTestId,
  headerStatusTestId,
  avatars,
  customAvatar,
}: DetailsHeaderProps) => {
  const { t } = useTranslation();

  const hasSubtitle = Boolean(subtitle);
  const hasCustomAvatar = customAvatar !== undefined;
  const status = getStatus(statusText, statusList);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        /* eslint-disable react-native/no-unused-styles */
        screenHeader: listItemStyle.detailsHeaderContainer[variant],
        topRow: listItemStyle.detailsHeaderTopRow[variant],
        avatarWrapper: listItemStyle.detailsHeaderAvatarWrapper[variant],
        avatarWrapperNoBorder: listItemStyle.avatarWrapperNoBorder,
        textWrapper: listItemStyle.textContainer,
        title: listItemStyle.detailsHeaderTitle,
        subtitle: listItemStyle.detailsHeaderSubtitle,
      }),
    [variant],
  );

  const getAvatar = () => {
    if (customAvatar !== undefined) {
      return customAvatar;
    }

    if (avatars && avatars.length > 0) {
      return <GroupAvatar avatars={avatars} size={44} />;
    }

    if (imagePath) {
      return <AvatarIcon id={id} imagePath={imagePath} size={44} />;
    }

    return null;
  };

  const avatar = getAvatar();

  return (
    <View style={styles.screenHeader}>
      <View style={styles.topRow}>
        {avatar && (
          <View
            testID={TestIDs.DETAILS_HEADER_AVATAR_CONTAINER}
            style={[styles.avatarWrapper, hasCustomAvatar && styles.avatarWrapperNoBorder]}
          >
            {avatar}
          </View>
        )}
        <View style={styles.textWrapper}>
          {hasSubtitle && (
            <Text style={styles.title} numberOfLines={1} testID={headerTitleTestId} selectable>
              {title.trim()}
            </Text>
          )}
          <Text
            style={[styles.subtitle, !hasSubtitle && styles.title]}
            numberOfLines={2}
            selectable
          >
            {hasSubtitle ? subtitle?.trim() : title.trim()}
          </Text>
        </View>
      </View>
      {status && statusText && (
        <Chip status={status} text={t(`status.${statusText}`)} testId={headerStatusTestId} />
      )}
    </View>
  );
};

export default DetailsHeader;
