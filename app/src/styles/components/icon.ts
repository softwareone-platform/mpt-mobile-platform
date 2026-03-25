import { BorderRadius, Color, Spacing } from '../tokens';

export const iconStyle = {
  backgroundContainer: {
    padding: Spacing.spacingSmall10,
    backgroundColor: Color.alerts.info1,
    borderRadius: BorderRadius.round,
  },
  iconColorPrimary: Color.brand.primary,
} as const;
