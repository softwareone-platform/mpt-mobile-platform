import type { ViewStyle } from 'react-native';

import { Color, Spacing, Typography, BorderRadius } from '../tokens';

import { badgeStyle } from './badge';
import { separatorStyle } from './separator';

const avatarWrapperCommon: ViewStyle = {
  borderRadius: 11,
  overflow: 'hidden',
  marginRight: Spacing.spacingSmall12,
};

const detailsHeaderContainerCommon: ViewStyle = {
  backgroundColor: Color.brand.white,
  paddingHorizontal: Spacing.spacing2,
  paddingBottom: Spacing.spacing2,
  flexDirection: 'column',
  borderBottomWidth: 1,
  borderBottomColor: Color.gray.gray2,
};

const detailsHeaderTopRowCommon: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  paddingBottom: Spacing.spacing2,
  paddingTop: Spacing.spacingSmall4,
};

export const listItemStyle = {
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.spacing2,
  },
  contentWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: separatorStyle.bottomBorder1.borderBottomWidth,
    borderBottomColor: separatorStyle.bottomBorder1.borderBottomColor,
  },
  textContainer: {
    flex: 1,
  },
  textContainerGrow: {
    flexGrow: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: Spacing.spacing1,
    marginLeft: Spacing.spacing2,
  },
  title: {
    fontSize: Typography.fontSize.font4,
    color: Color.labels.primary,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  textOnly: {
    contentWrapper: {
      paddingVertical: Spacing.spacingSmall12,
    },
  },
  textAndIcon: {
    contentWrapper: {
      paddingVertical: Spacing.spacing3,
    },
    iconWrapper: {
      marginRight: Spacing.spacingSmall12,
    },
  },
  textAndImage: {
    avatarWrapper: {
      ...avatarWrapperCommon,
    },
    avatarWrapperChat: {
      borderRadius: BorderRadius.round,
      borderColor: Color.gray.gray2,
      borderWidth: 1,
    },
    contentWrapper: {
      paddingVertical: Spacing.spacing1,
    },
    subtitle: {
      fontSize: Typography.fontSize.font3,
      marginTop: Spacing.spacingSmall2,
      color: Color.gray.gray4,
    },
  },
  textInline: {
    contentWrapper: {
      paddingVertical: Spacing.spacing2,
    },
    textContainerInline: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flex: 1,
    },
    labelInline: {
      fontSize: Typography.fontSize.font4,
      color: Color.labels.primary,
      marginRight: 60,
      flexShrink: 0,
    },
    textInline: {
      fontSize: Typography.fontSize.font4,
      color: Color.labels.secondary,
      flexShrink: 1,
      marginRight: Spacing.spacingSmall12,
      textAlign: 'right',
    },
  },
  textAndStatus: {
    title: {
      marginBottom: Spacing.spacing1,
    },
    subtitle: {
      flexShrink: 1,
      fontSize: Typography.fontSize.font2,
      paddingRight: Spacing.spacing3,
    },
  },
  listItemDynamic: {
    container: {
      backgroundColor: Color.brand.white,
      paddingRight: Spacing.spacing2,
    },
    contentWrapper: {
      paddingRight: 0,
    },
    firstItem: {
      borderTopLeftRadius: BorderRadius.xl,
      borderTopRightRadius: BorderRadius.xl,
    },
    lastItem: {
      borderBottomLeftRadius: BorderRadius.xl,
      borderBottomRightRadius: BorderRadius.xl,
    },
  },
  detailsHeaderContainer: {
    default: {
      ...detailsHeaderContainerCommon,
    },
    chat: {
      ...detailsHeaderContainerCommon,
      paddingBottom: 0,
    },
  },
  detailsHeaderTopRow: {
    default: {
      ...detailsHeaderTopRowCommon,
    },
    chat: {
      ...detailsHeaderTopRowCommon,
      paddingBottom: Spacing.spacing1,
    },
  },
  detailsHeaderAvatarWrapper: {
    default: {
      ...avatarWrapperCommon,
    },
    chat: {
      ...avatarWrapperCommon,
      borderRadius: BorderRadius.round,
      borderColor: Color.gray.gray2,
      borderWidth: 1,
    },
  },
  detailsHeaderTitle: {
    fontSize: Typography.fontSize.font5,
    color: Color.labels.primary,
  },
  detailsHeaderSubtitle: {
    fontSize: Typography.fontSize.font2,
    marginTop: Spacing.spacing1,
    color: Color.gray.gray4,
  },
  disabled: {
    subtitle: {
      color: Color.labels.secondary,
    },
  },
} as const;

export const listItemChatStyle = {
  contentWrapper: {
    ...listItemStyle.contentWrapper,
    paddingVertical: Spacing.spacing1,
  },
  subtitle: {
    ...listItemStyle.textAndImage.subtitle,
    fontSize: Typography.fontSize.font2,
    flexShrink: 1,
  },
  textContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginLeft: Spacing.spacing2,
  },
  textColumn: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    minWidth: 0,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.spacingSmall4,
  },
  titleWrapper: {
    flexShrink: 1,
    minWidth: 0,
  },
  separator: {
    paddingHorizontal: Spacing.spacingSmall4,
    fontSize: Typography.fontSize.font2,
    color: Color.gray.gray4,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    flexShrink: 1,
  },
  companyText: {
    flexShrink: 1,
    fontSize: Typography.fontSize.font2,
    color: Color.gray.gray4,
  },
  iconWrapper: {
    marginLeft: Spacing.spacingSmall4,
    flexShrink: 0,
  },
  statusColumn: {
    marginLeft: Spacing.spacing2,
    flexShrink: 0,
    alignItems: 'flex-end',
  },
  messageCounter: {
    ...badgeStyle.info.container,
    ...badgeStyle.info.text,
    alignSelf: 'flex-end',
    marginTop: Spacing.spacingSmall4,
  },
  dateText: {
    marginVertical: Spacing.spacingSmall2,
    fontSize: Typography.fontSize.font1,
    color: Color.gray.gray4,
  },
} as const;
