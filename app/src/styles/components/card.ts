import { Color, BorderRadius, Spacing, Shadow, Typography } from '../tokens';

import { separatorStyle } from './separator';

export const cardStyle = {
  container: {
    backgroundColor: Color.brand.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.spacing2,
    margin: Spacing.spacing2,
  },
  containerWithShadow: {
    backgroundColor: Color.brand.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.spacing2,
    ...Shadow.md,
  },
  containerRounded: {
    backgroundColor: Color.brand.white,
    borderRadius: BorderRadius.xl,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: separatorStyle.nonOpaque.borderColor,
    paddingVertical: Spacing.spacing1,
    paddingHorizontal: Spacing.spacing2,
  },
  headerText: {
    fontSize: Typography.fontSize.font4,
    fontWeight: Typography.fontWeight.semibold,
    color: Color.gray.gray4,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: separatorStyle.nonOpaque.borderColor,
    paddingVertical: Spacing.spacing2,
    paddingHorizontal: Spacing.spacing2,
  },
  footerText: {
    fontSize: Typography.fontSize.font4,
    color: Color.brand.primary,
    textAlign: 'center',
  },
} as const;
