import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet } from 'react-native';

import AnimatedIcon from '@/components/common/AnimatedIcon';
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
  animatedIcon?: boolean;
  title?: string;
  description?: string;
  testID?: string;
  titleTestID?: string;
  descriptionTestID?: string;
};

const EmptyState = ({
  icon,
  animatedIcon,
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

  const renderIcon = () => {
    if (!icon) return null;

    const iconName = icon.name || DEFAULT_ICON_NAME;
    const iconSize = icon.size || DEFAULT_ICON_SIZE;
    const iconColor = icon.color || DEFAULT_ICON_COLOR;
    const iconVariant = icon.variant || DEFAULT_ICON_VARIANT;

    if (animatedIcon) {
      return <AnimatedIcon name={iconName} size={iconSize} />;
    }

    return <DynamicIcon name={iconName} variant={iconVariant} size={iconSize} color={iconColor} />;
  };

  return (
    <View testID={testID} style={styles.container}>
      {icon && <View style={styles.iconWrapper}>{renderIcon()}</View>}
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
