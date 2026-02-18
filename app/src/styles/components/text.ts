import { Color, Typography } from '../tokens';

const textCommon = {
  color: Color.brand.type,
  fontWeight: Typography.fontWeight.regular,
};

const textErrorCommon = {
  color: Color.brand.danger,
  fontWeight: Typography.fontWeight.regular,
};

export const textStyle = {
  textRegular: {
    ...textCommon,
    fontSize: Typography.fontSize.font3,
  },
  textLarge: {
    ...textCommon,
    fontSize: Typography.fontSize.font4,
  },
  textSmall: {
    ...textCommon,
    fontSize: Typography.fontSize.font2,
  },
  textErrorRegular: {
    ...textErrorCommon,
    fontSize: Typography.fontSize.font3,
  },
  textErrorSmall: {
    ...textErrorCommon,
    fontSize: Typography.fontSize.font2,
  },
} as const;
