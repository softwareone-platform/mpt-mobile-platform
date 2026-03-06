import type { ViewStyle } from 'react-native';

import { BorderRadius, Color } from '../tokens';

const regionCommon: ViewStyle = {
  position: 'absolute',
  borderColor: Color.brand.white,
};

export const avatarStyle = {
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  commonIconContainer: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
  },
  smallIconContainer: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.round,
  },
  largeIconContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.round,
  },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Color.fills.tertiary,
  },
  imageStyle: {
    width: '100%',
    height: '100%',
  },
} as const;

export const groupAvatarStyle = {
  container: {
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: Color.gray.gray2,
    borderRadius: '50%',
  },
  avatarInner: {
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  regionFull: {
    ...regionCommon,
    width: '100%',
    height: '100%',
  },

  regionLeft: {
    ...regionCommon,
    width: '50%',
    height: '100%',
    top: 0,
    left: 0,
  },
  regionRight: {
    ...regionCommon,
    width: '50%',
    height: '100%',
    top: 0,
    left: '50%',
    borderLeftWidth: 1,
  },
  regionTopRight: {
    ...regionCommon,
    width: '50%',
    height: '50%',
    top: 0,
    left: '50%',
    borderBottomWidth: 1,
    borderLeftWidth: 1,
  },
  regionBottomRight: {
    ...regionCommon,
    width: '50%',
    height: '50%',
    top: '50%',
    left: '50%',
    borderLeftWidth: 1,
  },
  regionTopLeft: {
    ...regionCommon,
    width: '50%',
    height: '50%',
    top: 0,
    left: 0,
    borderBottomWidth: 1,
  },
  regionBottomLeft: {
    ...regionCommon,
    width: '50%',
    height: '50%',
    top: '50%',
    left: 0,
  },
} as const;
