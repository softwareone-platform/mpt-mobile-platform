import { Platform, StyleSheet } from 'react-native';

import { Color } from '../tokens';

export const separatorStyle = {
  nonOpaque: {
    borderColor: Color.separators.nonOpaque,
    borderWidth: 1,
  },
  nativeDivider: Platform.select({
    ios: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: Color.separators.nonOpaque,
    },
    android: {
      elevation: 1,
    },
    default: {},
  }),
} as const;
