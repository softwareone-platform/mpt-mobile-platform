import { BorderRadius, Color, Spacing, Typography } from '../tokens';

export const tabStyle = {
  container: {
    backgroundColor: Color.fills.tertiary,
    borderRadius: BorderRadius.round,
    padding: Spacing.spacingSmall4,
    flexDirection: 'row',
    marginBottom: Spacing.spacing2,
  },
} as const;

export const tabItemStyle = {
  container: {
    flex: 1,
    paddingVertical: Spacing.spacingSmall4,
    paddingHorizontal: Spacing.spacing2,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemSelected: {
    backgroundColor: Color.brand.white,
  },
  label: {
    fontSize: Typography.fontSize.font2,
    lineHeight: Typography.lineHeight.height2,
    color: Color.brand.type,
  },
  labelSelected: {
    fontWeight: Typography.fontWeight.semibold,
  },
} as const;
