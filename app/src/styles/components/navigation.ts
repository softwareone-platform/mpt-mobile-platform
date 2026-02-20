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
      ...cardStyle.containerRounded,
      ...cardStyle.containerSpacingOnly,
      paddingTop: 0,
      paddingBottom: 0,
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
    navigationItem: {
      flexDirection: 'row',
      alignItems: 'center',
      ...separatorStyle.bottomBorder1,
    },
    label: {
      fontSize: Typography.fontSize.font3,
      color: Color.alerts.info4,
    },
    labelDisabled: {
      color: Color.gray.gray3,
    },
    labelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',

      flex: 1,
      marginLeft: Spacing.spacing2,
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
