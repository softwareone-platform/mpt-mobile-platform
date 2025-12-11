import { Color, Spacing, Typography } from '../tokens';

export const emptyStateStyle = {
  iconWrapper: {
    paddingBottom: Spacing.spacing2,
  },
  title: {
    fontSize: Typography.fontSize.font5,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: Spacing.spacing2,
    color: Color.brand.type,
  },
  description: {
    fontSize: Typography.fontSize.font3,
    textAlign: 'center',
    color: Color.gray.gray6,
  },
} as const;
