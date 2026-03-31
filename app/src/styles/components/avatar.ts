import type { ViewStyle } from 'react-native';

import { BorderRadius, Color } from '../tokens';

const containerBorderCommon: ViewStyle = {
  borderWidth: 1,
  borderColor: Color.gray.gray2,
};

const regionCommon: ViewStyle = {
  position: 'absolute',
  borderColor: Color.brand.white,
};

const badgeCommon: ViewStyle = {
  position: 'absolute',
  borderWidth: 1,
  backgroundColor: Color.brand.white,
  borderColor: Color.brand.white,
  borderRadius: BorderRadius.xxs,
};

export const avatarSize = {
  default: 44,
  small: 32,
  medium: 48,
  large: 80,
};

export const badgeSize = {
  small: 12,
  medium: 16,
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
    width: avatarSize.default,
    height: avatarSize.default,
    borderRadius: BorderRadius.md,
  },
  smallBadgeContainer: {
    width: badgeSize.small,
    height: badgeSize.small,
    borderRadius: BorderRadius.xxs,
  },
  mediumBadgeContainer: {
    width: badgeSize.medium,
    height: badgeSize.medium,
    borderRadius: BorderRadius.xxs,
  },
  smallIconContainer: {
    ...containerBorderCommon,
    width: avatarSize.small,
    height: avatarSize.small,
    borderRadius: BorderRadius.round,
  },
  mediumIconContainer: {
    ...containerBorderCommon,
    width: avatarSize.medium,
    height: avatarSize.medium,
    borderRadius: BorderRadius.round,
  },
  largeIconContainer: {
    ...containerBorderCommon,
    width: avatarSize.large,
    height: avatarSize.large,
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
} as const;

export const avatarWithBadgeStyle = {
  small: {
    container: {
      position: 'relative',
      width: avatarSize.small,
      height: avatarSize.small,
    },
    badge: {
      ...badgeCommon,
      bottom: -3,
      right: -3,
      width: badgeSize.small,
      height: badgeSize.small,
    },
  },
  medium: {
    container: {
      position: 'relative',
      width: avatarSize.medium,
      height: avatarSize.medium,
    },
    badge: {
      ...badgeCommon,
      bottom: -2,
      right: -2,
      width: badgeSize.medium,
      height: badgeSize.medium,
    },
  },
} as const;
