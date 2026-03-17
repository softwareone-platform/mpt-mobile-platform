import type { ViewStyle, TextStyle } from 'react-native';

import { BorderRadius, Color, Spacing, Typography } from '../tokens';

const AVATAR_OFFSET_HORIZONTAL = 48;
const AVATAR_OFFSET_VERTICAL = 22;

const containerCommon: ViewStyle = {
  flexDirection: 'row',
  gap: Spacing.spacing2,
  alignItems: 'flex-start',
};

const chatTextCommon: TextStyle = {
  fontSize: Typography.fontSize.font2,
  fontWeight: Typography.fontWeight.regular,
  lineHeight: Typography.lineHeight.height3,
};

const textContainerCommon: ViewStyle = {
  padding: Spacing.spacing2,
  borderRadius: BorderRadius.sm,
  marginBottom: Spacing.spacing2,
};

const infoCommon: ViewStyle = {
  flexDirection: 'row',
  gap: Spacing.spacing1,
  marginBottom: Spacing.spacingSmall4,
};

export const chatStyle = {
  detailsHeaderContainer: {
    paddingBottom: Spacing.spacing0,
  },
  detailsHeaderTopRow: {
    paddingBottom: Spacing.spacing1,
  },
  textInputWrapper: {
    flex: 1,
  },
  iconContainer: {
    paddingBottom: Spacing.spacingSmall6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.spacing2,
    padding: Spacing.spacing2,
    borderTopWidth: 1,
    borderColor: Color.gray.gray2,
    backgroundColor: Color.brand.white,
  },
} as const;

export const chatMessageStyle = {
  avatarWrapper: {
    paddingTop: AVATAR_OFFSET_VERTICAL,
  },
  messageWrapper: {
    flexGrow: 1,
    flexShrink: 1,
  },
  infoText: {
    color: Color.gray.gray4,
  },
  own: {
    container: {
      ...containerCommon,
    },
    textContainer: {
      ...textContainerCommon,
      backgroundColor: Color.brand.primary,
      marginLeft: AVATAR_OFFSET_HORIZONTAL,
    },
    text: {
      ...chatTextCommon,
      color: Color.brand.white,
    },
    info: {
      ...infoCommon,
      justifyContent: 'flex-end',
    },
  },
  other: {
    container: {
      ...containerCommon,
    },
    textContainer: {
      ...textContainerCommon,
      backgroundColor: Color.gray.gray2,
    },
    text: {
      ...chatTextCommon,
      color: Color.brand.type,
    },
    info: {
      ...infoCommon,
    },
  },
} as const;
