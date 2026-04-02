import type { ViewStyle, TextStyle } from 'react-native';
import type { MixedStyleDeclaration } from 'react-native-render-html';

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
  paddingVertical: Spacing.spacing1,
  paddingHorizontal: Spacing.spacing2,
  borderRadius: BorderRadius.sm,
  marginBottom: Spacing.spacing1,
  gap: Spacing.spacingSmall6,
  maxWidth: '100%',
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
  iconColor: Color.brand.type,
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
    textColor: Color.brand.white,
    linkColor: Color.brand.white,
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
    textColor: Color.brand.type,
    linkColor: Color.brand.primary,
  },
} as const;

export const chatMarkdownStyle = {
  image: {
    width: '100%',
    marginTop: Spacing.spacingSmall4,
    marginBottom: Spacing.spacingSmall4,
  },
  fontSize: Typography.fontSize.font2,
  lineHeight: Typography.lineHeight.height3,
  headingMarginBottom: Spacing.spacingSmall4,
  headingBoldWeight: Typography.fontWeight.bold,
  headingSemiboldWeight: Typography.fontWeight.semibold,
} as const;

export const getChatMarkdownTagStyles = (
  color: string,
  linkColor: string,
): Record<string, MixedStyleDeclaration> => ({
  p: { marginTop: 0, marginBottom: 0 },
  a: { color: linkColor },
  strong: { color, fontWeight: chatMarkdownStyle.headingBoldWeight },
  em: { color, fontStyle: 'italic' },
  del: { color, textDecorationLine: 'line-through' },
  u: { color, textDecorationLine: 'underline' },
  sub: { color, fontSize: Typography.fontSize.font1 },
  sup: { color, fontSize: Typography.fontSize.font1 },
  h1: {
    color,
    fontSize: Typography.fontSize.font6,
    fontWeight: chatMarkdownStyle.headingBoldWeight,
    marginTop: 0,
    marginBottom: chatMarkdownStyle.headingMarginBottom,
  },
  h2: {
    color,
    fontSize: Typography.fontSize.font5,
    fontWeight: chatMarkdownStyle.headingBoldWeight,
    marginTop: 0,
    marginBottom: chatMarkdownStyle.headingMarginBottom,
  },
  h3: {
    color,
    fontSize: Typography.fontSize.font4,
    fontWeight: chatMarkdownStyle.headingSemiboldWeight,
    marginTop: 0,
    marginBottom: chatMarkdownStyle.headingMarginBottom,
  },
  h4: {
    color,
    fontSize: Typography.fontSize.font3,
    fontWeight: chatMarkdownStyle.headingSemiboldWeight,
    marginTop: 0,
    marginBottom: chatMarkdownStyle.headingMarginBottom,
  },
});

export const chatLinkPreviewStyle = {
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.spacing1,
    paddingVertical: Spacing.spacingSmall6,
    paddingHorizontal: Spacing.spacing1,
    borderRadius: BorderRadius.sm,
    backgroundColor: Color.gray.gray1,
    marginBottom: Spacing.spacingSmall2,
  },
  icon: {
    width: 20,
    height: 20,
    borderRadius: BorderRadius.xs,
  },
  textColumn: {
    flexShrink: 1,
  },
  name: {
    flexShrink: 1,
    fontSize: Typography.fontSize.font1,
    color: Color.brand.type,
    fontWeight: Typography.fontWeight.bold,
  },
  url: {
    flexShrink: 1,
    fontSize: Typography.fontSize.font1,
    color: Color.gray.gray4,
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
