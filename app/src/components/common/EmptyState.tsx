import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet } from 'react-native';

import DynamicIcon from '@/components/common/DynamicIcon';
import { screenStyle, emptyStateStyle } from '@/styles';
import { Color } from '@/styles/tokens';

type EmptyStateProps = {
  icon?: {
    name?: string;
    variant?: 'filled' | 'outlined';
    size?: number;
    color?: string;
  };
  title?: string;
  description?: string;
  testID?: string;
  titleTestID?: string;
  descriptionTestID?: string;
};

const EmptyState = ({
  icon,
  title,
  description,
  testID,
  titleTestID,
  descriptionTestID,
}: EmptyStateProps) => {
  const { t } = useTranslation();

  const DEFAULT_ICON_NAME = 'how-to-reg';
  const DEFAULT_ICON_VARIANT = 'outlined';
  const DEFAULT_ICON_SIZE = 48;
  const DEFAULT_ICON_COLOR = Color.brand.primary;
  const DEFAULT_TITLE = t('common.message.noDataAvailable');

  return (
    <View testID={testID} style={styles.container}>
      {icon && (
        <View style={styles.iconWrapper}>
          <DynamicIcon
            name={icon.name || DEFAULT_ICON_NAME}
            variant={icon.variant || DEFAULT_ICON_VARIANT}
            size={icon.size || DEFAULT_ICON_SIZE}
            color={icon.color || DEFAULT_ICON_COLOR}
          />
        </View>
      )}

      <Text testID={titleTestID} style={styles.title}>
        {title || DEFAULT_TITLE}
      </Text>
      {description && (
        <Text testID={descriptionTestID} style={styles.description}>
          {description}
        </Text>
      )}
    </View>
  );
};

export default EmptyState;

const styles = StyleSheet.create({
  container: screenStyle.containerCenterContent,
  iconWrapper: emptyStateStyle.iconWrapper,
  title: emptyStateStyle.title,
  description: emptyStateStyle.description,
});
