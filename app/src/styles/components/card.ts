import { Color, BorderRadius, Spacing, Shadow } from '../tokens';

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
} as const;