import { BorderRadius, Color, Spacing, Typography } from '../tokens';

export const tabStyle = {
  container: {
    backgroundColor: Color.brand.white,
    borderRadius: BorderRadius.round,
    padding: Spacing.spacingSmall4,
    flexDirection: 'row',
    marginBottom: Spacing.spacing2,
  },
} as const;

export const tabItemStyle = {
  container: {
    flex: 1,
    paddingVertical: Spacing.spacing1,
    paddingHorizontal: Spacing.spacingSmall12,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemSelected: {
    backgroundColor: Color.brand.primary,
  },
  label: {
    fontSize: Typography.fontSize.font3,
    lineHeight: Typography.lineHeight.height2,
    color: Color.brand.primary,
  },
  labelSelected: {
    color: Color.brand.white,
  },
} as const;
