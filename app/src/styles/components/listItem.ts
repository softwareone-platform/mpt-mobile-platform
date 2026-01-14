import { Color, Spacing, Typography, BorderRadius } from '../tokens';

import { separatorStyle } from './separator';

export const listItemStyle = {
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing.spacing2,
  },
  contentWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: Spacing.spacing2,
    borderBottomWidth: 1,
    borderBottomColor: separatorStyle.nonOpaque.borderColor,
  },
  textContainer: {
    flex: 1,
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
      borderRadius: 11,
      overflow: 'hidden',
      marginRight: Spacing.spacingSmall12,
    },
    contentWrapper: {
      paddingVertical: Spacing.spacing1,
    },
    subtitle: {
      fontSize: Typography.fontSize.font3,
      marginTop: Spacing.spacingSmall2,
      color: Color.labels.secondary,
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
} as const;
