import { BorderRadius, Color, Spacing, Typography } from '../tokens';

export const accountSummaryStyle = {
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: Spacing.spacing4,
  },
  avatarWrapper: {
    borderRadius: BorderRadius.round,
    overflow: 'hidden',
    marginBottom: Spacing.spacing2,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.fontSize.font6,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: Typography.lineHeight.height6,
    color: Color.labels.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.fontSize.font3,
    textAlign: 'center',
    color: Color.labels.secondary,
  },
} as const;
