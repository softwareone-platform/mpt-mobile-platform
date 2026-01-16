import { Color, Typography } from '../tokens';

const linkCommon = {
  color: Color.brand.primary,
  fontWeight: Typography.fontWeight.regular,
};

export const linkStyle = {
  linkLarge: {
    ...linkCommon,
    fontSize: Typography.fontSize.font4,
  },
  linkRegular: {
    ...linkCommon,
    fontSize: Typography.fontSize.font3,
  },
  linkSmall: {
    ...linkCommon,
    fontSize: Typography.fontSize.font2,
  },
  listItemLinkRegular: {
    color: Color.alerts.info4,
    fontWeight: Typography.fontWeight.regular,
    fontSize: Typography.fontSize.font3,
  },
} as const;
