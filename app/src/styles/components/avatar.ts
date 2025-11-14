import { BorderRadius } from '../tokens';

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
    marginRight: 8,
  },
} as const;
