import type { ViewStyle, TextStyle } from 'react-native';

import { BorderRadius, Color, Spacing, Typography } from '../tokens';

const chipTextCommon: TextStyle = {
  fontSize: Typography.fontSize.font2,
  fontWeight: Typography.fontWeight.regular,
  lineHeight: Typography.lineHeight.height3,
};

const chipContainerCommon: ViewStyle = {
  paddingVertical: Spacing.spacingSmall2,
  paddingHorizontal: Spacing.spacingSmall10,
  borderRadius: BorderRadius.round,
  alignSelf: 'flex-start',
};

export const chipStyle = {
  default: {
    container: {
      ...chipContainerCommon,
      backgroundColor: Color.gray.gray1,
    },
    text: {
      ...chipTextCommon,
      color: Color.gray.gray5,
    },
  },
  info: {
    container: {
      ...chipContainerCommon,
      backgroundColor: Color.alerts.info1,
    },
    text: {
      ...chipTextCommon,
      color: Color.alerts.info4,
    },
  },
  warning: {
    container: {
      ...chipContainerCommon,
      backgroundColor: Color.alerts.warning1,
    },
    text: {
      ...chipTextCommon,
      color: Color.alerts.warning4,
    },
  },
  danger: {
    container: {
      ...chipContainerCommon,
      backgroundColor: Color.alerts.danger1,
    },
    text: {
      ...chipTextCommon,
      color: Color.alerts.danger4,
    },
  },
  success: {
    container: {
      ...chipContainerCommon,
      backgroundColor: Color.alerts.success1,
    },
    text: {
      ...chipTextCommon,
      color: Color.alerts.success4,
    },
  },
} as const;
