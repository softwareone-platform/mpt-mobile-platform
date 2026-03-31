import type { ViewStyle, TextStyle } from 'react-native';

import { BorderRadius, Color, Spacing, Typography } from '../tokens';

const SMALL_AVATAR_SIZE = 32;
const AVATAR_OFFSET_HORIZONTAL = SMALL_AVATAR_SIZE + Spacing.spacing2;
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

const messageWrapperCommon: ViewStyle = {
  flexGrow: 1,
  flexShrink: 1,
};

export const chatMessageStyle = {
  avatarWrapper: {
    paddingTop: AVATAR_OFFSET_VERTICAL,
  },
  infoText: {
    color: Color.gray.gray4,
  },
  own: {
    container: {
      ...containerCommon,
      justifyContent: 'flex-end',
      paddingLeft: AVATAR_OFFSET_HORIZONTAL,
    },
    messageWrapper: {
      ...messageWrapperCommon,
      alignItems: 'flex-end',
    },
    textContainer: {
      ...textContainerCommon,
      backgroundColor: Color.brand.primary,
    },
    text: {
      ...chatTextCommon,
      color: Color.brand.white,
    },
    info: {
      ...infoCommon,
    },
  },
  other: {
    container: {
      ...containerCommon,
    },
    messageWrapper: {
      ...messageWrapperCommon,
      alignItems: 'flex-start',
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

const wizardHeaderButtonCommon = {
  fontSize: Typography.fontSize.font3,
  color: Color.brand.type,
};

export const createChatWizardStyle = {
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.spacing2,
  },
  headerSide: {
    minWidth: 60,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.fontSize.font4,
    fontWeight: Typography.fontWeight.medium,
    lineHeight: Typography.lineHeight.height5,
  },
  headerTextCancel: {
    ...wizardHeaderButtonCommon,
  },
  headerTextNext: {
    ...wizardHeaderButtonCommon,
    color: Color.brand.primary,
  },
  headerButtonDisabled: {
    color: Color.gray.gray4,
  },
} as const;
