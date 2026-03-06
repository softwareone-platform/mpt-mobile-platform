import type { ViewStyle, TextStyle } from 'react-native';

import { BorderRadius, Color, Spacing, Typography } from '../tokens';

const badgeTextCommon: TextStyle = {
  fontSize: Typography.fontSize.font1,
  fontWeight: Typography.fontWeight.regular,
  lineHeight: Typography.lineHeight.heightSmall12,
};

const badgeContainerCommon: ViewStyle = {
  paddingHorizontal: Spacing.spacing1,
  paddingVertical: Spacing.spacingSmall4,
  borderRadius: BorderRadius.round,
  alignSelf: 'flex-start',
};

export const badgeStyle = {
  info: {
    container: {
      ...badgeContainerCommon,
      backgroundColor: Color.alerts.info1,
    },
    text: {
      ...badgeTextCommon,
      color: Color.alerts.info4,
    },
  },
} as const;
