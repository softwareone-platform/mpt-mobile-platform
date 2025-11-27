import { BorderRadius, Color } from '../tokens';

export const avatarStyle = {
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.round,
    overflow: 'hidden',
  },
  topBarIconContainer: {
    marginRight: 16,
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
