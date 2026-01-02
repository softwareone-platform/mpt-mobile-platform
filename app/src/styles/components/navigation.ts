import { Color, Spacing, Typography } from '../tokens';

import { cardStyle } from './card';
import { separatorStyle } from './separator';

export const navigationStyle = {
  primary: {
    container: {
      paddingTop: 11,
      height: 100,
      backgroundColor: Color.brand.white,
    },
    label: {
      fontSize: 12,
      marginTop: 6,
    },
  },
  secondary: {
    container: {
      ...cardStyle.container,
      paddingTop: 0,
      paddingBottom: 0,
      paddingRight: -16,
    },
    navigationItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    label: {
      fontSize: Typography.fontSize.font3,
      color: Color.labels.primary,
    },
    labelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: separatorStyle.nonOpaque.borderColor,
      flex: 1,
      marginLeft: 12,
      paddingRight: 15,
      paddingVertical: Spacing.spacing2,
    },
    lastItem: {
      borderBottomWidth: 0,
    },
  },
  header: {
    title: {
      color: Color.brand.type,
    },
    backTitle: {
      color: Color.brand.primary,
      marginLeft: 6,
    },
  },
} as const;
