import { Color, BorderRadius, Spacing, Shadow, Typography } from '../tokens';

import { separatorStyle } from './separator';

export const cardStyle = {
  container: {
    backgroundColor: Color.brand.white,
    borderRadius: BorderRadius.xl,
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
  containerRoundedBottom: {
    backgroundColor: Color.brand.white,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  containerSpacingOnly: {
    padding: Spacing.spacing2,
    marginBottom: Spacing.spacing2,
  },
  headerContainer: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    backgroundColor: Color.brand.white,
    paddingHorizontal: Spacing.spacing2,
  },
  header: {
    ...separatorStyle.bottomBorder1,
    paddingVertical: Spacing.spacingSmall12,
  },
  headerText: {
    fontSize: Typography.fontSize.font3,
    fontWeight: Typography.fontWeight.semibold,
    color: Color.gray.gray4,
  },
  footer: {
    ...separatorStyle.topBorder1,
    paddingVertical: Spacing.spacing2,
    marginHorizontal: Spacing.spacing2,
  },
  footerText: {
    fontSize: Typography.fontSize.font4,
    color: Color.brand.primary,
    textAlign: 'center',
  },
  body: {
    padding: Spacing.spacing2,
  },
  bodyText: {
    fontSize: Typography.fontSize.font4,
    color: Color.brand.type,
    fontWeight: Typography.fontWeight.regular,
  },
} as const;
