import { BorderRadius, Color, Spacing, Typography } from '../tokens';

export const filterStyle = {
  containerHorizontal: {
    paddingVertical: Spacing.spacing2,
    flexShrink: 0,
  },
  pillBarContent: {
    paddingHorizontal: Spacing.spacing2,
    flexDirection: 'row',
    gap: Spacing.spacing1,
  },
  chip: {
    paddingVertical: Spacing.spacingSmall4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.round,
    backgroundColor: Color.fills.tertiary,
  },
  chipActive: {
    backgroundColor: Color.brand.primary,
  },
  chipText: {
    fontSize: Typography.fontSize.font3,
    lineHeight: Typography.lineHeight.height3,
    color: Color.brand.primary,
    fontWeight: Typography.fontWeight.regular,
  },
  chipTextActive: {
    color: Color.brand.white,
  },
} as const;
