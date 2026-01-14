import { Color, Spacing, Typography } from '../tokens';

export const authLayoutStyle = {
  safeArea: {
    flex: 1,
    backgroundColor: Color.brand.white,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.spacing3,
    paddingTop: 55,
  },
  logoSection: {
    alignItems: 'center' as const,
    paddingTop: Spacing.spacing4,
    paddingBottom: Spacing.spacing4,
  },
  logo: {
    width: 76,
    height: 76,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: Typography.fontSize.font3,
    fontWeight: Typography.fontWeight.bold,
    color: Color.brand.type,
    textAlign: 'left' as const,
    marginBottom: Spacing.spacing2,
  },
  subtitle: {
    fontSize: Typography.fontSize.font3,
    color: Color.brand.type,
    textAlign: 'left' as const,
    lineHeight: Typography.fontSize.font3 * Typography.lineHeight.relaxed,
    marginBottom: Spacing.spacing4,
  },
} as const;
