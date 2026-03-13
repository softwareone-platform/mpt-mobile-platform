import type { ViewStyle } from 'react-native';

import { Color, BorderRadius, Spacing, Typography } from '../tokens';

const buttonCommon: ViewStyle = {
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: BorderRadius.round,
  paddingVertical: Spacing.spacing2,
  paddingHorizontal: Spacing.spacing3,
};

export const buttonStyle = {
  primaryLight: {
    ...buttonCommon,
    backgroundColor: Color.brand.white,
    color: Color.brand.primary,
  },
  primaryLightText: {
    color: Color.brand.primary,
    fontSize: Typography.fontSize.font4,
    fontWeight: Typography.fontWeight.regular,
  },
  primary: {
    ...buttonCommon,
    backgroundColor: Color.brand.primary,
  },
  primaryIconOnly: {
    paddingVertical: Spacing.spacingSmall6,
    paddingHorizontal: Spacing.spacingSmall6,
  },
  secondary: {
    ...buttonCommon,
    backgroundColor: Color.alerts.info1,
    borderWidth: 1,
    borderColor: Color.alerts.info1,
    borderRadius: BorderRadius.md,
  },
  authPrimary: {
    ...buttonCommon,
    backgroundColor: Color.brand.primary,
    marginBottom: Spacing.spacing2,
  },
  authPrimaryText: {
    fontSize: Typography.fontSize.font3,
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'center' as const,
    color: Color.brand.white,
  },
  authSecondary: {
    height: 48,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: Spacing.spacing3,
    backgroundColor: Color.gray.gray1,
    borderWidth: 1,
    borderColor: Color.gray.gray3,
    marginBottom: Spacing.spacing2,
  },
  authSecondaryText: {
    fontSize: Typography.fontSize.font3,
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'center' as const,
    color: Color.gray.gray5,
  },
  fullWidth: {
    width: '100%',
  },
} as const;
