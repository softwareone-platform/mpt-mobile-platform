import { BorderRadius, Color, Spacing } from '../tokens';

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
  topBarIconWrapper: {
    marginRight: Spacing.spacing2,
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
