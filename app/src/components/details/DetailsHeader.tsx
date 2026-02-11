import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet } from 'react-native';

import AvatarIcon from '@/components/avatar/Avatar';
import Chip from '@/components/chip/Chip';
import { statusList } from '@/constants/status';
import { listItemStyle } from '@/styles';
import type { ListItemWithStatusProps } from '@/types/lists';
import { getStatus } from '@/utils/list';

const DetailsHeader = ({ id, imagePath, title, subtitle, statusText }: ListItemWithStatusProps) => {
  const { t } = useTranslation();

  const hasSubtitle = Boolean(subtitle);
  const hasImage = Boolean(imagePath);
  const status = getStatus(statusText, statusList);

  return (
    <View style={styles.screenHeader}>
      <View style={styles.topRow}>
        {hasImage && (
          <View style={styles.avatarWrapper}>
            <AvatarIcon id={id} imagePath={imagePath} size={44} />
          </View>
        )}
        <View style={styles.textWrapper}>
          {hasSubtitle && (
            <Text style={styles.title} numberOfLines={1}>
              {title.trim()}
            </Text>
          )}
          <Text style={[styles.subtitle, !hasSubtitle && styles.title]} numberOfLines={2}>
            {hasSubtitle ? subtitle?.trim() : title.trim()}
          </Text>
        </View>
      </View>
      {status && <Chip status={status} text={t(`status.${statusText}`)} />}
    </View>
  );
};

const styles = StyleSheet.create({
  screenHeader: listItemStyle.detailsHeaderContainer,
  topRow: listItemStyle.detailsHeaderTopRow,
  textWrapper: listItemStyle.textContainer,
  title: listItemStyle.detailsHeaderTitle,
  subtitle: listItemStyle.detailsHeaderSubtitle,
  avatarWrapper: listItemStyle.textAndImage.avatarWrapper,
});

export default DetailsHeader;
