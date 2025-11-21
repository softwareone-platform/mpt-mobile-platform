import { Color, Spacing, Typography } from '../tokens';
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
      paddingVertical: 12,
    },
  },
  textAndIcon: {
    contentWrapper: {
      paddingVertical: Spacing.spacing3,
    },
    iconWrapper: {
      marginRight: 12,
    },
  },
  textAndImage: {
    avatarWrapper: {
      borderRadius: 11,
      overflow: 'hidden',
      marginRight: 12,
    },
    contentWrapper: {
      paddingVertical: Spacing.spacing1,
    },
    subtitle: {
      fontSize: Typography.fontSize.font3,
      marginTop: 2,
      color: Color.labels.secondary,
    },
  },
} as const;
